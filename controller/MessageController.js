var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Socket = require('../bin/www');

exports.sendMessage = async function(req, res) {
   var message = new Message(req.body);
   await message.save((err) => {
      console.log('ip: ' + req.path);
      var io = Socket.io;
      io.emit('send-msg', 'hieunpqh')
      if(err) sendStatus(500);
      res.sendStatus(200);
   })
}
