var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var socket = require('../socket/SocketServer');

exports.createTransaction = async function(data, io) {
   var transInfo = {
      transactionId : data.transactionId,
      qrCode: data.qrCode
   }
   var transaction = new Transaction(transInfo);
   await transation.save((err) => {
      if(err) console.log(500);
   })
}
