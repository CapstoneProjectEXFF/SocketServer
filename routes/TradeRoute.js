var trading = require('../controller/TradeController');

module.exports = function (app) {
   //user send message
   app.route('/trading')
      .get(trading.getUserTrading)
      .post(trading.createTrade);
   app.route('/trading/msg')
      .get(trading.getRoomMessage);
}
