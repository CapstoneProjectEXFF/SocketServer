var transaction = require('../controller/TransactionController');

module.exports = function (app) {
   //user send message
    app.route('/transaction')
      .post(transation.sendTransaction);
}
