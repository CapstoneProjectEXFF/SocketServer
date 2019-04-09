const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
   users: [{userId: String, userName: String, item: [String]}],
   messages: [{
      sender: String,
      msg: String
      //   sentTime: Date
   }],
   room: String,
   status: Number
}, {
   collection: 'Trade',
   max: 1000
})

