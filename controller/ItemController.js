var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var Socket = require('../bin/www');
var io = Socket.io;

exports.getRoomMessage = async function(req, res) {
      await Trade.find({'room': req.query.roomId}, {'messages.sender': 1, 'messages.msg': 1}, function(err, trades) {
         //console.log(req.query.userId);
         res.send(trades);
   });
}

exports.addRoomReq = async function(req, io) {
   console.log(`${req.userId} added item ${req.itemId} to room ${req.room}`);
   await Item.update({'itemId': req.itemId, 'userId': req.userId},
      {'$addToSet': {'rooms': [req.roomId]}},
      (item, err) => {
         console.log(item);
         if(err) console.log(500, err);
      }
   )
}

exports.removeRoomReq = async function(req, io) {
   console.log(`item ${req.itemId} removed from room ${req.room}`);
   await Item.update({'itemId': req.itemId},
      {'$pull': {'rooms': req.roomId}},
      (err, item) => {
         if(err) console.log(500, err);
      }
   )
}
