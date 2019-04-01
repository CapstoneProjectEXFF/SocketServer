var trading = require('../controller/TradeController');

module.exports = function (app) {
   //user send message
   app.route('/trading')
      .get(trading.getUserTrading)
      .post(trading.upsertTrade);
   app.route('/trading/msg')
      .get(trading.getRoomMessage);
   // app.route('/trading/room')
   //    .get(trading.isExistedRoom);
}
