const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   senderId: Number,
   receiverId: Number,
   items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
   }],
   status: Number,
}, {
   collection: 'Transaction',
   max: 1000
})

module.exports = mongoose.model('Transaction', transactionSchema);
