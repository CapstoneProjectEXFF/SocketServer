var trading = require('../controller/TradeController');

exports.ioOperate = function(io) {
   io.on('connection', socket => {
      console.log(`socket id ${socket.id}`);

      socket.on('get-room', async function(room) {
         console.log(`socket id ${socket.id}`);
         await trading.upsertTrade(room, io)
            .then(() =>{
               socket.join(roomName);
               io.to(roomName).emit('room-ready', roomName);
               console.log(`join room ${roomName}`);
            })
      })

      socket.on('rejoin-room', function(room) {
         console.log(`join room ${room.room}`);
         socket.join(room.room);
      })

      socket.on('send-msg', function(data) {
         trading.sendMessage(data);
         console.log(Object.keys(socket.rooms));
         io.to(data.room).emit('send-msg', data);
         //io.to(socket.id).emit('send-msg', data);
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
   })
}

