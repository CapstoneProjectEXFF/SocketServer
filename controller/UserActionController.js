var mongoose = require('mongoose');
var UserAction = mongoose.model('UserAction');
var Socket = require('../bin/www');
var io = Socket.io;


exports.createUserAction = async function(req) {
   var userAction = new UserAction({
      action: req.action,
      item: req.item,
      userId: req.userId,
      modifiedTime: new Date();
   });
   await userAction.save((err) => {
      console.log('action saved');
      if(err) console.log(500);
   })
}


exports.getUserAction = async function() {
}


