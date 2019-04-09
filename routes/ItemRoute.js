var item = require('../controller/ItemController');

module.exports = function (app) {
   //user send message
   app.route('/item/:userId')
      .get(item.getSuggestedItems);
}
