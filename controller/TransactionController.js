var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var socket = require('../socket/SocketServer');

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

checkTransactionStatus = async function(data, io) {
   await Transaction.find({$and: [
      {'qrCode': data.qrCode},
      {'users': {$size: 0}}
   ]},
      (err, result) => {
         if(result === null) return;
         io.to(data.socketId).emit('transaction-succeeded', data.transactionId);
      }
   )
}

exports.scanQRCode = async function(data, io) {
   await Transaction.update({'qrCode': data.qrCode},
      {'$pull': {users: data.user}},
      (err, result) => {
         if(err) console.log(500, err);
         console.log(Object.keys(result));
         if (result.nModified === 1) {
            io.to(data.socketId).emit('scan-succeeded',
               {transactionId: data.transactionId, userId: data.user});
         }
         checkTransactionStatus(data, io);
      }
   )
}

