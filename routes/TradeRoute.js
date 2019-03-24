var trading = require('../controller/TradeController');

module.exports = function (app) {
   //user send message
    app.route('/trading')
      .post(trading.createTrade);
}
