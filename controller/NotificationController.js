var mongoose = require('mongoose');
var Notification = mongoose.model('Notification');
var Socket = require('../bin/www');
var io = Socket.io;

exports.saveNotification = async function(req, io) {
   await Notification.findOneAndUpdate(
      {'userId': req.userId},
      {'$addToSet': {activeNotifications: req.msg}},
      async (noti, err) => {
         if(err) console.log(500, err);
         if(!noti) {
            notification = new Notification({
               'userId': req.userId,
               'activeNotification': [req.noti]
            });
            await notification.save(err => {console.log(500, err)})
         }
      }
   );
}

exports.checkNotification = async function(req, io) {
   await Notification.update({'room': req.room},
      (err) => {
         if(err) console.log(500, err);
      }
   )
}
