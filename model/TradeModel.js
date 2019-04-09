const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
   users: [{
      userId: String,
      userName: String,
      item: [String],
      avatar: String,
      qrCode: String,
      status: {
         type: Number,
         default: function() {return 0;}
      }
   }],
   messages: [{
      sender: String,
      msg: String
      //   sentTime: Date
   }],
   room: String,
   activeTime: Date,
   transferTime: Date,
   transferLocation: String,
   status: Number
}, {
   collection: 'Trade',
   max: 1000
})

module.exports = mongoose.model('Trade', tradeSchema);
