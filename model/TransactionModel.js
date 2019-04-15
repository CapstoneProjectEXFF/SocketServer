const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   transactionId: Number,
   users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
   }],
   qrCode: String,
   status: Number,
}, {
   collection: 'Transaction',
   max: 1000
})

module.exports = mongoose.model('Transaction', transactionSchema);
