const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
   //  userA: String,
   //  userB: String,
   users: [{userId: String, item: [String]}],
   //userA: {userId: String, item: []},
   //userB: {userId: String, item: []},
   //userAItem: [],
   //userBItem: [],
   room: String,
   status: Number
   //users: [
   //
   //]
}, {
   collection: 'Trade',
   max: 1000
})

module.exports = mongoose.model('Trade', tradeSchema);
