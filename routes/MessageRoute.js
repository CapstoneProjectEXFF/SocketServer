var mes = require('../controller/MessageController');

module.exports = function (app) {
   //user send message
    app.route('/message')
      .post(mes.sendMessage);
}
