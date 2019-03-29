const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
   users: [{userId: String, item: [String]}],
   messages: [{
      sender: String,
      msg: String
      //   sendedTime: Date
   }],
   room: String,
   status: Number
}, {
   collection: 'Trade',
   max: 1000
})

module.exports = mongoose.model('Trade', tradeSchema);
