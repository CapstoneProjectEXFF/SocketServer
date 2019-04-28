var trading = require('../controller/TradeController');

module.exports = function (app) {
   //user send message
   app.route('/trading')
      .get(trading.getUserTrading)
      .post(trading.upsertTrade);
   app.route('/room')
      .get(trading.getRoomById);
   app.route('/notification')
      .get(trading.getUserNotification);
   app.route('/trading/msg')
      .get(trading.getRoomMessage);
}
