var trading = require('../controller/TradeController');
var user = require('../controller/UserController');
var transaction = require('../controller/TransactionController');
var noti = require('../controller/NotificationController');

exports.ioOperate = function(io) {
   io.on('connection', socket => {
      trading.initIO(io);
      socket.on('get-room', function(room) {
         console.log(`socket id ${socket.id}`);
         //trading.upsertTrade(room, io, socket);
         trading.upsertTrade(room, socket);
      })

      socket.on('assign-user', function(userId){
         console.log(`user moi vo hehe ${userId}: ${socket.id}`);
         user.assignUser({userId: userId, socketId: socket.id})
      })

      socket.on('rejoin-room', function(room) {
         console.log(`join room ${room.room}`);
         socket.join(room.room);
      })

      socket.on('send-msg', function(data) {
         //trading.sendMessage(data, io);
         trading.sendMessage(data);
         console.log(Object.keys(socket.rooms));
      });

      socket.on('send-req', function(data) {
         io.emit('send-req', data);
      })

      socket.on('add-item', function(data) {
         //trading.addItem(data, io);
         trading.addItem(data);
      })

      socket.on('remove-item', function(data) {
         //trading.removeItem(data, io);
         trading.removeItem(data);
      })

      socket.on('reset-trade', function(data) {
         //trading.resetTrade(data, io);
         trading.resetTrade(data);
      })

      socket.on('confirm-trade', function(data) {
         //trading.confirmTrade(data, io);
         trading.confirmTrade(data);
      })

      socket.on('unconfirm-trade', function(data) {
         //trading.unconfirmTrade(data, io);
         trading.unconfirmTrade(data);
      })

      socket.on('qr-scan', function(data) {
         data.socketId = socket.id;
         //transaction.scanQRCode(data, io);
         transaction.scanQRCode(data, io);
      })

      socket.on('noti-read', function(data) {
         trading.checkNoti(data);
      })
   })
}

