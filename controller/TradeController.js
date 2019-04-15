var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Item = mongoose.model('Item');
var Socket = require('../bin/www');
var io = Socket.io;
var itemController = require('./ItemController');
var tradeController = require('./TradeController');
var fetch = require('node-fetch');
var Bluebird = require('bluebird');
var crypto = require('crypto');

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
   var roomName = null;
   await Trade.findOneAndUpdate({$and: [
      {"users.userId": users[0]},
      {"users.userId": users[1]}
   ]}, {"activeTime": new Date()} ,  async function(err, trade) {
      if (err) console.log(500);
      if (trade === null) {
         roomName = await createTrade({room: req.room,
            userA: users[0], userB: users[1]}, io)
         console.log(`create new room ${roomName}`);
      } else {
         roomName = trade.room;
         console.log(`update room ${roomName}`)
      }
   })
   return await Promise.resolve(roomName);
}

getUserFromAPI = async function(userId) {
   fetch.Promise = Bluebird;
   return await fetch(`http://35.247.191.68:8080/user/${userId}`, {
      method: 'GET',
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json'
      }
   })
      .then(res => res.text())
      .then(body => {
         return Promise.resolve(JSON.parse(body));
      })
} 

createTrade = async function(roomInfo, io) {
   //var userA = await getUserFromAPI(roomInfo.userA);
   var res = await fetch(`http://35.247.191.68:8080/user/${roomInfo.userA}`);
   var userA = await res.json();
   var res2 = await fetch(`http://35.247.191.68:8080/user/${roomInfo.userB}`);
   var userB = await res2.json();
   userA.userId = roomInfo.userA;
   userA.status = 0;
   userB.userId = roomInfo.userB;
   userB.status = 0;
   var tradeInfo = {
      //users: [{userId: roomInfo.userA},
      //   {userId: roomInfo.userB}],
      users: [userA, userB],
      message: [], room: roomInfo.room,
      activeTime: new Date(),
      status: 0
   };
   var trade = new Trade(tradeInfo);
   await trade.save((err) => {
      console.log('now i save');
      if(err) console.log(500);
   })
   return await Promise.resolve(roomInfo.room);
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
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$addToSet': {'users.$.item': [req.itemId]}, 'status': 0},
      (err, trade) => {
         //console.log(trade);
         if(err) console.log(500);
         var item = {
            room: req.room,
            itemId: req.itemId,
            userId: req.userId
         }
         itemController.markItem(req.itemId, req.room);
         io.to(req.room).emit('item-added', item);
         io.to(req.room).emit('send-msg', {sender: -5, msg: req.itemId})
         console.log(`${req.userId} added item ${req.itemId} to room ${req.room}`);
      }
   )
}

exports.removeItem = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'$pull': {'users.$.item': req.itemId}, 'status': 0},
      (err, trade) => {
         if(err) console.log(500);
         var item = {
            room: req.room,
            itemId: req.itemId,
            userId: req.userId
         }
         itemController.unmarkItem(req.itemId, req.room);
         io.to(req.room).emit('item-removed', item);
         io.to(req.room).emit('send-msg', {sender: -6, msg: req.itemId})
         console.log(`item ${req.itemId} removed from room ${req.room}`);
      }
   )
}

exports.confirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 1},
      (err, trade) => {
         checkTradeStatus(req, io);
         if(err) console.log(500);
      }
   )
}

exports.unconfirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 0},
      (err, trade) => {
         io.to(req.room).emit('trade-unconfirmed', {room: req.room, userId: req.userId});
         io.to(req.room).emit('send-msg', {sender: -2, msg: req.userId})
         if(err) console.log(500, err);
      }
   )
}

checkTradeStatus = async function(req, io) {
   console.log(`${req.userId} has confirmed`);
   var result = {
      userId: req.userId,
      room: req.room
   }
   io.to(req.room).emit('user-accepted-trade', result);
   io.to(req.room).emit('send-msg', {sender: -1, msg: req.userId})
   await Trade.findOne({$and: [
      {'room': req.room},
      {"users": {$not: {$elemMatch: {status: 0}}}}
   ]}, (err, trade) => {
      if(trade === null) return;
      var users = req.room.split('-').sort();
      var transactionWrapper = {
         "transaction": {
            "receiverId": users[0],
            "senderId": users[1],
            "qrCode": crypto.createHash('sha256')
         },
         "details": []
      }

      var c = trade.users.map(u => 
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
            var bodyRes = JSON.parse(body);
            var transInfo = {
               transactionId:  bodyRes.message,
               room: req.room
            }
            io.to(req.room).emit("trade-done", transInfo);
            io.to(req.room).emit('send-msg', {sender: -4, msg: req.room})
            console.log('hello im spring: ' + bodyRes.message);
            tradeController.resetTrade(req, io);
         });
      if(err) console.log(500, err);
   }
   )
}

exports.resetTrade = async function(req, io) {
   await Trade.update({'room': req.room},
      {$set: {"users.$[].item": []}, 'status': 0},
      (err, trade) => {
         if(err) console.log(500);
         io.to(req.room).emit('trade-reseted', req.room);
         io.to(req.room).emit('send-msg', {sender: -3, msg: req.room})
         console.log(`${req.userId} has reset`);
      }
   )
}


