var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var socket = require('../socket/SocketServer');
var Client  = require('@elastic/elasticsearch')
var client = new Client.Client({ node: 'http://35.247.191.68:9200' })

exports.getUserTransaction = async function(req, res) {
   await Transaction.find({$and: [
      {"users": {$in: [req.params.userId]}}
   ]}, function(err, transaction) {
      //console.log(transaction)
      res.send(transaction);
   })
}

exports.getUserFriend = async function(data, io) {
   await client.search({
      index: 'exff_rela',
      type: 'relationship',
      body: {
         query: {
            multi_match: {
               query: req.params.userId,
               fields: ['sender_id', 'receiver_id']
            }
         }
      }
   }).then(response => {
      var result = response.body.hits;
      var dataset = result.hits.map(hit => {
         return {
            sender_id: hit._source.sender_id,
            receiver_id: hit._source.receiver_id
         }
      });
      //console.log(dataset);
      return dataset;
   })
}

exports.createTransaction = async function(data, io) {
   var transInfo = {
      transactionId : data.transactionId,
      users: data.users,
      qrCode: data.qrCode
   }
   var transaction = new Transaction(transInfo);
   await transaction.save((err) => {
      if(err) console.log(500);
   })
}

checkTransactionStatus = async function(data, io, token) {
   await Transaction.find({$and: [
      {'qrCode': data.qrCode},
      {'users': {$size: 0}}
   ]},
      async (err, result) => {
         if(result.length === 0) return;
         var confirmResult = await fetch(
            `http://35.247.191.68:8080/transaction/${result[0].transactionId}`, {
               method: 'PUT',
               headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': token
               }
            });
         var result = await confirmResult.json();
         console.log(`trao doi thanh cong ${result[0].transactionId}`);
         io.to(data.socketId).emit('transaction-succeeded', result[0].transactionId);
      }
   )
}

exports.scanQRCode = async function(data, io) {
   await Transaction.findOneAndUpdate({'qrCode': data.qrCode},
      {'$pull': {users: data.userId}},
      async (err, result) => {
         if(err) console.log(500, err);
         if(result !== undefined) {
            await Transaction.find({'qrCode': data.qrCode}, function(err, res) {
               console.log(`${data.userId} scan thanh cong ${data.qrCode}`);
               if(res[0] !== undefined) {
                  io.to(data.socketId).emit('scan-succeeded',
                     {transactionId: res[0].transactionId, userId: data.userId});
                  checkTransactionStatus(data, io, data.token);
               }
            })
         }
      }
   )
}

