const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   userId: String,
   socketId: String
}, {
   collection: 'User',
   max: 1000
})

module.exports = mongoose.model('User', userSchema);
