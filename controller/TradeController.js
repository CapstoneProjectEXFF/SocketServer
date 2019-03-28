var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Socket = require('../bin/www');
var io = Socket.io;
var tradingSpace = Socket.tradingSpace;

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

exports.getUserTrading = async function(req, res) {
      await Trade.find({'users.userId': req.query.userId}, function(err, trades) {
         console.log(trades)
         //console.log(req.query.userId);
         res.send(trades);
   })
}

exports.createTrade = async function(roomInfo, io) {
   //var tradeInfo = {userA:{userId:'hieu'}, userB:{userId:'thang'}, room: room};
   var tradeInfo = {
      users: [{userId: roomInfo.userA}, {userId: roomInfo.userB}],
      room: roomInfo.room, status: 1
   };
   //var tradeInfo = {userA:'hieu', userB:'thang', room: room};
   var trade = new Trade(tradeInfo);
   await trade.save((err) => {
      if(err) console.log(500);
      io.emit('create-trade', roomInfo.room);
      console.log('namespace name: ' + Socket.tradingSpace.name);
   })
}

exports.addItem = async function(req, io) {
   console.log(`item ${req.itemId} added to room ${req.room}`);
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$addToSet': {'users.$.item': [req.itemId]}},
      (err) => {
         //console.log(trade);
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
