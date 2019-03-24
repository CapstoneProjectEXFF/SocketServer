const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   content: String,
}, {
   collection: 'Message',
   max: 1000
})

module.exports = mongoose.model('Message', messageSchema);
