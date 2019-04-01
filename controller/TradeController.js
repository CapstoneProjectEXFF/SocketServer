var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Socket = require('../bin/www');
var io = Socket.io;
var tradingSpace = Socket.tradingSpace;
var item = require('../controller/ItemController');

//exports.createTrade = async function(req, res) {
//   var trade = new Trade(req.body);
//   var trade = new Trade(tradeInfo);
//   await trade.save((err) => {
//      if(err) sendStatus(500);
//      io.emit('create-trade', req.body.room);
//      console.log('namespace name: ' + Socket.tradingSpace.name);
//      res.sendStatus(200);
//   })
//}
//
isExistedRoom = async function(room, io) {
   await Trade.find({'room': roomId}, function(err, trades) {
      if (trades.length === 0 ) {
         console.log('room existed');
         createTrade(req, io);
      }
      console.log('update room');
      activeTrade(req.room);
   })
}

exports.getUserTrading = async function(req, res) {
   await Trade.find({'users.userId': req.query.userId},
      {'_id': 0, 'users._id': 0},{activeTime: 'desc'}, function(err, trades) {
         console.log(trades)
         //console.log(req.query.userId);
         res.send(trades);
      })
}

exports.getRoomMessage = async function(req, res) {
   await Trade.find({'room': req.query.roomId}, {'messages.sender': 1, 'messages.msg': 1}, function(err, trades) {
      //console.log(req.query.userId);
      res.send(trades);
   });
}

exports.upsertTrade = async function(req, io) {
   await Trade.find({'room': req.room}, function(err, trades) {
      if (trades.length === 0 ) {
         console.log('room existed');
         createTrade(req, io);
      } else {
         console.log('update room');
         activeTrade(req.room);
      }
      io.emit('room-ready');
   })
}

activeTrade = async function(roomId) {
   await Trade.updateOne({'room': roomId},
      {activeTime: new Date()},
      (err) => {
         //console.log(trade);
         if(err) console.log(500, err);
      }
   )
}

createTrade = async function(roomInfo, io) {
   //var tradeInfo = {userA:{userId:'hieu'}, userB:{userId:'thang'}, room: room};
   var tradeInfo = {
      users: [{userId: roomInfo.userA}, {userId: roomInfo.userB}],
      message: [], room: roomInfo.room,
      activeTime: new Date(),
      status: 1
   };
   //var tradeInfo = {userA:'hieu', userB:'thang', room: room};
   var trade = new Trade(tradeInfo);
   await trade.save((err) => {
      if(err) console.log(500);
      io.emit('create-trade', roomInfo.room);
      console.log('namespace name: ' + Socket.tradingSpace.name);
   })
}

exports.sendMessage = async function(req, io) {
   var message = {
      sender: req.sender,
      msg: req.msg
   }
   console.log(`${req.sender}: ${req.msg}`);
   await Trade.update({'room': req.room},
      {'$addToSet': {messages: message}},
      (err) => {
         //console.log(trade);
         if(err) console.log(500, err);
      }
   )
}

exports.addItem = async function(req, io) {
   console.log(`${req.userId} added item ${req.itemId} to room ${req.room}`);
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$addToSet': {'users.$.item': [req.itemId]}},
      (trade, err) => {
         console.log(trade);
         if(err) console.log(500, err);
      }
   )
}

exports.removeItem = async function(req, io) {
   console.log(`item ${req.itemId} removed from room ${req.room}`);
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$pull': {'users.$.item': req.itemId}},
      (err, trade) => {
         if(err) console.log(500, err);
      }
   )
}
