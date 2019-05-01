const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
   itemId: String,
   ownerId: String,
   rooms: [String],
   status: Number,
   like: [String]
}, {
   collection: 'Item',
   max: 1000
})

module.exports = mongoose.model('Item', itemSchema);
