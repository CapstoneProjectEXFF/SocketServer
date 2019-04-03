var trading = require('../controller/TradeController');

exports.ioOperate = function(io) {
   io.on('connection', socket => {
      console.log('user connected');

      socket.on('get-room', function(room) {
         socket.join(room.room);
         console.log(`join room ${room.room}`);
         trading.upsertTrade(room, io);
      })

      socket.on('send-msg', function(data) {
         console.log('msg: ' + data);
         trading.sendMessage(data);
         io.emit('send-msg', data);
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
      
      socket.on('cancel-trade', function(data) {
         trading.cancelTrade(data, io);
      })

      socket.on('confirm-trade', function(data) {
         trading.confirmTrade(data, io);
      })
   })
}

