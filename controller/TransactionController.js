var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var socket = require('../socket/SocketServer');

exports.createTransaction = async function(data, io) {
   var transInfo = {
      transactionId : data.transactionId,
      qrCode: data.qrCode
   }
   var transaction = new Transaction(transInfo);
   await transaction.save((err) => {
      if(err) console.log(500);
   })
}

exports.scanQRCode = async function(data, io) {
   await Transaction.update({'transactionId': data.transactionId},
      {'$addToSet': {users: data.user}},
      (err) => {
         if(err) console.log(500, err);
      }
   )
}

