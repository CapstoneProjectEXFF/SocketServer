var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Item = mongoose.model('Item');
var Socket = require('../bin/www');
var io = Socket.io;
var tradingSpace = Socket.tradingSpace;
var item = require('../controller/ItemController');
var fetch = require('node-fetch');
var qr = require('qr-image');
var Bluebird = require('bluebird');

exports.getUserTrading = async function(req, res) {
   await Trade.find({'users.userId': req.query.userId},
      {'_id': 0, 'users._id': 0},{activeTime: 'desc'}, function(err, trades) {
         res.send(trades);
      })
}

exports.getRoomById = async function(req, res) {
   await Trade.findOne({'room': req.query.room},
      {'_id': 0, 'users._id': 0}, function(err, trade) {
         res.send(trade);
      })
}

exports.getRoomMessage = async function(req, res) {
   await Trade.find({'room': req.query.roomId},
      {'messages.sender': 1, 'messages.msg': 1}, function(err, trades) {
         res.send(trades);
      });
}

exports.upsertTrade = async function(req, io) {
   var users = req.room.split('-');
   await Trade.updateOne({$and: [
      {"users.userId": users[0]},
      {"users.userId": users[1]}
   ]}, {"activeTime": new Date()} , function(err, trade) {
      if (err) console.log(500);
      console.log(trade);
      if (trade.n === 0) {
         console.log('create new room');
         createTrade(req, io);
      }
      io.emit('room-ready', req.room);
   })
}

createTrade = async function(roomInfo, io) {
   var tradeInfo = {
      users: [{userId: roomInfo.userA}, {userId: roomInfo.userB}],
      message: [], room: roomInfo.room,
      activeTime: new Date(),
      status: 0
   };
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
         var item = {
            itemId: req.itemId,
            userId: req.userId
         }
         io.emit('item-added', item);
      }
   )
}

exports.removeItem = async function(req, io) {
   console.log(`item ${req.itemId} removed from room ${req.room}`);
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$pull': {'users.$.item': req.itemId}},
      (err, trade) => {
         if(err) console.log(500, err);
         var item = {
            itemId: req.itemId,
            userId: req.userId
         }
         io.emit('item-removed', item);
      }
   )
}

exports.confirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 1},
      (err, trade) => {
         checkTradeStatus(req, io);
         if(err) console.log(500, err);
      }
   )
}

exports.unconfirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 0, 'status': 0},
      (err, trade) => {
         checkTradeStatus(req, io);
         if(err) console.log(500, err);
      }
   )
}

checkTradeStatus = async function(req, io) {
   console.log(`${req.userId} has confirmed`);
   io.to(req.room).emit('user-accepted-trade', `${req.userId}`);
   await Trade.findOneAndUpdate({$and: [
      {'room': req.room},
      {"users": {$not: {$elemMatch: {status: 0}}}}
   ]}, {"status": 1}, (err, trade) => {
         if(trade.length === 1) {
            var users = req.room.split('-').sort();
            var transactionWrapper = {
               "transaction": {
                  "receiverId": users[0],
                  "senderId": users[1]
               },
               "details": []
            }

            var c = trade[0].users.map(u => 
               u.item.map(i =>
                  {return {"userId": u.userId, "itemId": i}}
               ))

            transactionWrapper.details = transactionWrapper.details.concat(c[0]);
            transactionWrapper.details = transactionWrapper.details.concat(c[1]);

            console.log(transactionWrapper.details);
            fetch.Promise = Bluebird;
            fetch('http://35.247.191.68:8080/transaction', {
               method: 'POST',
               body: JSON.stringify(transactionWrapper),
               headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': req.token
               }
            })
               .then(res => res.text())
               .then(body => {
                  io.emit("trade-done", req.room);
                  console.log('hello im spring: ' + body)
               });
         }
         if(err) console.log(500, err);
      }
   )
}

exports.resetTrade = async function(req, io) {
   console.log(`${req.userId} has reset`);
   await Trade.update({'room': req.room},
      {'status': 0, 'users.item': []},
      (err, trade) => {
         if(err) console.log(500, err);
         io.emit('trade-reseted', req.room);
      }
   )
}

