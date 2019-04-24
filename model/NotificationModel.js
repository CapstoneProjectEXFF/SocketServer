const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   room: String,
   notifications: [{
      message: String,
      userId: [String]
   }],
}, {
   collection: 'Notification',
   max: 1000
})

