var mongoose = require('mongoose');
var User = mongoose.model('User');
var tradeController = require('./TradeController');
var Socket = require('../bin/www');
var io = Socket.io;

exports.assignUser = async function(req, io) {
   await User.findOneAndUpdate({'userId': req.userId},
      {'$set': {socketId: req.socketId}},
      async (err, user) => {
         if(err) console.log(500, err);
         if(user === null) {
            var user = new User({
               userId: req.userId,
               socketId: req.socketId
            });
            await user.save((err) => {
               if(err) console.log(500);
            })
         }
      }
   )
}

exports.notiUserById = async function(userId, io, request) {
   await User.findOne({'userId': userId},
      {'_id': 0, 'users._id': 0}, function(err, user) {
         if(user) {
            console.log(`noti to ${userId}: ${user.socketId}`);
            io.to(user.socketId).emit(request.event, request.info);
         }
      })
}
