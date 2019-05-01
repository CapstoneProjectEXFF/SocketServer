var mongoose = require('mongoose');
var Trade = mongoose.model('Trade');
var Item = mongoose.model('Item');
var Notification = mongoose.model('Notification');
var Socket = require('../bin/www');
var io = Socket.io;
var itemController = require('./ItemController');
var tradeController = require('./TradeController');
var userController = require('./UserController');
var transactionController = require('./TransactionController');
var fetch = require('node-fetch');
var Bluebird = require('bluebird');
var crypto = require('crypto');
var socketId;

exports.initSocket = function(id) {
   socketId = id;
   console.log(socketId);
}

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

exports.upsertTrade = async function(req, io, socket) {
   var users = req.room.split('-');
   var roomName; 
   await Trade.findOneAndUpdate({$and: [
      {"users.userId": users[0]},
      {"users.userId": users[1]}
   ]}, {"activeTime": new Date()} , async function(err, trade) {
      if (err) console.log(500);
      if (trade === null) {
         roomName = await createTrade({room: req.room,
            userA: users[0], userB: users[1]}, io)
         console.log(`create new room ${roomName}`);
         socket.join(roomName);
         io.to(roomName).emit('room-ready', roomName);
         console.log(`join room ${roomName}`);
      } else {
         roomName = trade.room;
         socket.join(roomName);
         io.to(roomName).emit('room-ready', roomName);
         console.log(`update room ${trade.room}`)
         console.log(`join room ${roomName}`);
      }
   })
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
      message: [], notifications: [], room: roomInfo.room,
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
      {'$addToSet': {messages: message}, "activeTime": new Date()},
      (err) => {
         if(err) console.log(500, err);
         io.to(req.room).emit('send-msg',
            {sender: req.sender, msg: req.msg, room: req.room}
         )
      }
   )
}

exports.saveNoti = async function(req, io) {
   io.in(req.room).clients(async (err, clients) => {
      console.log(`phong nay co ${clients.length}`);
      if(clients.length < 2) {
         var users = req.room.split('-').sort();
         var receiver = users.filter(i => i !== '' + req.userId);

         var noti = {
            receiverId: receiver,
            msg: req.msg,
            notiType: req.notiType,
            status: 0,
            activeTime: new Date()
         }
         await Trade.update({'room': req.room},
            {'$addToSet': {notifications: noti}},
            async (err) => {
               if(err) console.log(500, err);
               userController.notiUserById(receiver, io);
            })
      }
   })
}

exports.checkNoti = async function(req, io) {
   console.log('noti read');
   await Trade.update({'notifications._id': mongoose.Types.ObjectId(req)},
      {'$set': {'notifications.$.status': 1}},
      (err) => {
         if(err) console.log(500, err);
         //io.to(req.room).emit('trade-change',
         //   {receiver: req.receiver, msg: req.msg, room: req.room}
         //)
      }
   )
}

//exports.getUserNotification = async function(req, res) {
//   await Trade.aggregate([
//      {
//         $project: {
//            notifications: {
//               $filter: {
//                  input: "$notifications",
//                  as: "notifications",
//                  cond: {$and: [
//                     {$eq: ["$$notifications.receiverId", req.query.userId]},
//                     {$eq: ["$$notifications.status", 0]}
//                  ]}
//               }
//            },
//            user: {
//               $filter: {
//                  input: "$users",
//                  as: "users",
//                  cond: {$ne: ["$$users.userId", req.query.userId]}
//               }
//            }
//         }
//      }
//   ], function(err, noti) {
//      var result = noti.filter(i => i.notifications.length > 0);
//      res.send(result);
//   })
//}

exports.getNotification = async function(req) {
   return await Trade.find({'users.userId': req.query.userId},
      {'_id': 0, 'users._id': 0},{activeTime: 'desc'}, function(err, trades) {
      })
   //return Promise.resolve(trade);
}
exports.getUserNotification = async function(req, res) {
   tradeController.getNotification(req)
      .then(trades => {
         var result = [];
         trades.forEach(info => {
            var userInfo = info.users.filter(u => u.userId !== req.query.userId)
            var notif = info.notifications[info.notifications.length -1 ];
            if(notif.status === 0 && notif.receiverId.includes(req.query.userId)) {
               result.push({user: userInfo, notification: notif});
            }
         })
         return result;
      })
      .then(result => {
         console.log('day la result',result);
         res.send(result)

      })
}

recheckRoom = async function(req, io) {
   await Trade.findOneAndUpdate({$and: [
      {'room': req.room},
      {"users": {$elemMatch: {status: 1}}}
   ]}, {'users.$[].status': 0}
      , (err, trade) => {
         if(err) console.log(500);
         if(trade === null) return;
         console.log(`co nguoi da chot ${trade}`);
         io.to(req.room).emit('trade-unconfirmed', {room: req.room, userId: req.userId});
      })
}

exports.addItem = async function(req, io) {
   recheckRoom(req, io);
   await Trade.update({'room': req.room, 'users.userId': req.ownerId},
      {'$addToSet': {'users.$.item': [req.itemId]},
         'status': 0, "activeTime": new Date()},
      (err, trade) => {
         //console.log(trade);
         if(err) console.log(500);
         var item = {
            room: req.room,
            itemId: req.itemId,
            userId: req.userId,
            ownerId: req.ownerId
         }
         itemController.markItem(req.itemId, req.room, req.userId);
         io.to(req.room).emit('item-added', item);
         //io.to(req.room).emit('send-msg', {sender: -5, msg: req.itemId, room: req.room})
         req.notiType = -5;
         req.msg = req.itemId;
         //tradeController.sendMessage(req, io);
         tradeController.saveNoti(req, io)
         console.log(`${req.userId} added item ${req.itemId} to room ${req.room}`);
      }
   )
}

exports.removeItem = async function(req, io) {
   recheckRoom(req, io);
   await Trade.update({'room': req.room, 'users.userId': req.ownerId},
      {'$pull': {'users.$.item': req.itemId},
         'status': 0, "activeTime": new Date()},
      (err, trade) => {
         if(err) console.log(500);
         var item = {
            room: req.room,
            itemId: req.itemId,
            userId: req.userId,
            ownerId: req.ownerId
         }
         itemController.unmarkItem(req.itemId, req.room, req.userId);
         io.to(req.room).emit('item-removed', item);
         req.notiType = -6;
         req.msg = req.itemId;
         tradeController.saveNoti(req, io)
         console.log(`${req.userId} remove item ${req.itemId} from room ${req.room}`);
      }
   )
}

exports.confirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 1, "activeTime": new Date()},
      (err, trade) => {
         checkTradeStatus(req, io);
         if(err) console.log(500);
      }
   )
}

exports.unconfirmTrade = async function(req, io) {
   await Trade.update({'room': req.room, 'users.userId': req.userId},
      {'users.$.status': 0, "activeTime": new Date()},
      (err, trade) => {
         io.to(req.room).emit('trade-unconfirmed', {room: req.room, userId: req.userId});
         //io.to(req.room).emit('send-msg', {sender: -2, msg: req.userId, room: req.room})
         req.notiType = -2;
         req.msg = req.userId;
         //tradeController.sendMessage(req, io);
         tradeController.saveNoti(req, io)
         if(err) console.log(500, err);
      }
   )
}

generateQR = function(users) {
   var hash = crypto.createHash('sha256');
   var code = users[0] + users[1] + new Date();
   code = hash.update(code);
   code = hash.digest(code);
   return code.toString('hex');
}

checkTradeStatus = async function(req, io) {
   console.log(`${req.userId} has confirmed`);
   var result = {
      userId: req.userId,
      room: req.room
   }
   io.to(req.room).emit('user-accepted-trade', result);
   req.notiType = -1;
   req.msg = req.userId;
   tradeController.saveNoti(req, io)
   await Trade.findOne({$and: [
      {'room': req.room},
      {"users": {$not: {$elemMatch: {status: 0}}}}
   ]}, (err, trade) => {
      if(trade === null) return;
      var users = req.room.split('-').sort();
      var qrCode = generateQR(users);
      var transactionWrapper = {
         "transaction": {
            "receiverId": users[0],
            "senderId": users[1],
            "qrCode": qrCode
         },
         "details": []
      }


      var transInfo = {
         room: req.room,
         qrCode: qrCode,
         users: []
      }

      var c = trade.users.map(u => 
         u.item.map(i =>
            {
               itemController.notifyItemUnavailable({
                  itemId: i,
                  userId: u.userId,
                  room: req.room,
               }, io);
               return {"userId": u.userId, "itemId": i}
            }
         ))
      c.forEach((items, index) => {
         if (items.length > 0) {
            transactionWrapper.details = transactionWrapper.details.concat(items);
            transInfo.users = transInfo.users.concat(users[index]);
         }
      })
      req.body = {};
      req.body.transactionWrapper = transactionWrapper;
      req.body.token = req.token;
      req.transInfo = transInfo;
      console.log(transactionWrapper.details);
      tradeController.fetchTransactionAPI(req, io);
      if(err) console.log(500, err);
   }
   )
}

exports.fetchTransactionAPI = function(req, response, io) {
   var transWrapper = req.body.transactionWrapper;
   fetch.Promise = Bluebird;
   fetch('http://35.247.191.68:8080/transaction', {
      method: 'POST',
      body: JSON.stringify(transWrapper),
      headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': req.body.token
      }
   })
      .then(res => res.text())
      .then(body => {
         var bodyRes = JSON.parse(body);
         var users = [transWrapper.transaction.senderId, transWrapper.transaction.receiverId];
         if (req.transInfo === undefined) {
            console.log('hello');
            req.transInfo = {
               qrCode: generateQR(users),
               users: users,
               donationId: transWrapper.donationId,
            }
         }
         req.transInfo.transactionId = bodyRes.message;
         transactionController.createTransaction(req.transInfo);
         if(req.room !== undefined) {
            io.to(req.room).emit("trade-done", req.transInfo);
            tradeController.resetTrade(req, io);
            req.notiType = -4;
            req.msg = req.room;
            req.transactionId = req.transInfo.transactionId;
            req.userId = ''
            tradeController.saveNoti(req, io);
         } else {
            if(res !== undefined) {
               console.log('xong roi', response);
               response.send(bodyRes.message);
            }
         }

         console.log('hello im spring: ' + bodyRes.message);
      });
}

exports.resetTrade = async function(req, io) {
   await Trade.update({'room': req.room},
      {$set: {"users.$[].item": []}, 'users.$[].status': 0, 'status': 0},
      (err, trade) => {
         if(err) console.log(500);
         io.to(req.room).emit('trade-reseted',
            {room: req.room, userId: req.userId});
         //io.to(req.room).emit('send-msg', {sender: -3, msg: req.room, room: req.room})
         req.notiType = -3;
         req.msg = req.room;
         //tradeController.sendMessage(req, io);
         tradeController.saveNoti(req, io);
         console.log(`${req.userId} has reset`);
      }
   )
}


