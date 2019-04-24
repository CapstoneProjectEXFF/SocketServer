const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   userId: String,
   activeNotifications: [String],
   archiveNotifications: [String]
}, {
   collection: 'Notification',
   max: 1000
})

