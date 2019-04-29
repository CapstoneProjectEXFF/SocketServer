var trading = require('../controller/TradeController');
var user = require('../controller/UserController');
var transaction = require('../controller/TransactionController');
var noti = require('../controller/NotificationController');

exports.ioOperate = function(io) {
   io.on('connection', socket => {
      socket.on('get-room', function(room) {
         console.log(`socket id ${socket.id}`);
         trading.upsertTrade(room, io, socket);
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
         trading.sendMessage(data, io);
         console.log(Object.keys(socket.rooms));
      });

      socket.on('send-req', function(data) {
         io.emit('send-req', data);
      })

      socket.on('add-item', function(data) {
         trading.addItem(data, io);
      })

      socket.on('remove-item', function(data) {
         trading.removeItem(data, io);
      })

      socket.on('reset-trade', function(data) {
         trading.resetTrade(data, io);
      })

      socket.on('confirm-trade', function(data) {
         trading.confirmTrade(data, io);
      })

      socket.on('unconfirm-trade', function(data) {
         trading.unconfirmTrade(data, io);
      })

      socket.on('qr-scan', function(data) {
         data.socketId = socket.id;
         transaction.scanQRCode(data, io);
      })

      socket.on('noti-read', function(data) {
         trading.checkNoti(data);
      })
   })
}

