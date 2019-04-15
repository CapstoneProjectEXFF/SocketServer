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
         console.log(Object.keys(result));
         if(result[0] === null) return;
         console.log(`trao doi thanh cong ${result[0].transactionId}`);
         io.to(data.socketId).emit('transaction-succeeded', result[0].transactionId);
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
         console.log(`${data.user} scan thanh cong ${data.qrCode}`);
            io.to(data.socketId).emit('scan-succeeded',
               {transactionId: data.transactionId, userId: data.user});
         }
         checkTransactionStatus(data, io);
      }
   )
}

