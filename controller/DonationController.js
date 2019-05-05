var transactionController = require('./TransactionController');

exports.getDonations = async function(req, res) {
   transactionController.getUserFriend(req);
}
