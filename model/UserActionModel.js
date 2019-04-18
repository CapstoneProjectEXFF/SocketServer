const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
   action: String,
   item: String,
   userId: String,
   modifiedTime: Date,
   status: Number
}, {
   collection: 'Action',
   max: 1000
})

module.exports = mongoose.model('UserAction', actionSchema);
