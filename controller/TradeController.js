var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Socket = require('../bin/www');
var io = Socket.io;
var tradingSpace = Socket.tradingSpace;
var item = require('../controller/ItemController');
var fetch = require('node-fetch');
var Bluebird = require('bluebird');

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

exports.getUserTrading = async function(req, res) {
   console.log('hello')
   await Trade.find({'users.userId': req.query.userId},
      {'_id': 0, 'users._id': 0},{activeTime: 'desc'}, function(err, trades) {
         console.log(trades)
         //console.log(req.query.userId);
         res.send(trades);
      })
}

exports.getRoomById = async function(req, res) {
   await Trade.findOne({'room': req.query.room},
      {'_id': 0, 'users._id': 0}, function(err, trade) {
         console.log(trade)
         //console.log(req.query.userId);
         res.send(trade);
      })
}


exports.getRoomMessage = async function(req, res) {
   await Trade.find({'room': req.query.roomId}, {'messages.sender': 1, 'messages.msg': 1}, function(err, trades) {
      //console.log(req.query.userId);
      res.send(trades);
   });
}

isExistedRoom = function(roomId, reqId) {
   var oldId = roomId.split('-').sort();
   var newId = reqId.split('-').sort();
   var res = oldId.map((x, i) => x === newId[i] ? true: false);
   if (res.indexOf(false) === -1) return false;
   return true;
}

exports.upsertTrade = async function(req, io) {
   await Trade.find({'room': req.room}, function(err, trades) {
      if (trades.length === 0 ) {
         console.log('create new room');
         createTrade(req, io);
      } else {
         if (!isExistedRoom(trades[0].room, req.room)) {
            console.log('create new room');
            createTrade(req, io);
         } else {
            console.log('update room');
            activeTrade(req.room);
         }
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

exports.confirmTrade = async function(req, io) {
   console.log(`${req.userId} has confirmed`);
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 1},
      (err, trade) => {
         checkTradeStatus(req);
         if(err) console.log(500, err);
      }
   )
}

checkTradeStatus = async function(req, io) {
   console.log(`${req.userId} has confirmed`);
   await Trade.find({$and:[{'room': req.room}, {'users.status': 1}]},
      {'users': 1},
      (err, users) => {
         console.log(users.length);
         if(users.length === 1) {
            fetch.Promise = Bluebird;
            fetch('http://localhost:8080/transaction')
               .then(res => res.text())
               .then(body => console.log('hello im spring' + body));
         }
         if(err) console.log(500, err);
      }
   )
}

exports.cancelTrade = async function(req, io) {
   console.log(`${req.userId} has canceled`);
   await Trade.update({'room': req.room},
      {'tradeStatus': -1},
      (err, trade) => {
         if(err) console.log(500, err);
      }
   )
}

