var transaction = require('../controller/TransactionController');
//var item = require('../controller/ItemController');

module.exports = function (app) {
   //user send message
   app.route('/transaction/:userId')
      .get(transaction.getUserTransaction);
}
