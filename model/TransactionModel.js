const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   transactionId: Number,
   users: [String],
   qrCode: String,
   status: {
      type: Number,
      default: function() {return 0;}
   }
}, {
   collection: 'Transaction',
   max: 1000
})

module.exports = mongoose.model('Transaction', transactionSchema);
