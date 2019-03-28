var trading = require('../controller/TradeController');

exports.ioOperate = function(io) {
   io.on('connection', socket => {
      console.log('user connected');

      socket.on('room', function(room) {
         socket.join(room);
         console.log(`Room ${room} create`);
         //var trade = {userA: 'hieu', userB: 'thang', room: room};
         trading.createTrade(room, io);
      })

      socket.on('send-msg', function(data) {
         console.log('msg: ' + data);
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

      socket.on('create-trade', function(room) {
         socket.join(room);
      })
   })
}

