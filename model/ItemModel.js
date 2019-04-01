const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
   usersId: String,
   itemId: String,
   rooms: [String],
   status: Number
}, {
   collection: 'Item',
   max: 1000
})

module.exports = mongoose.model('Item', itemSchema);
