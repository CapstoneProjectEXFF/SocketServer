var mongoose = require('mongoose');
var Transaction = mongoose.model('Transaction');
var socket = require('../socket/SocketServer');

	exports.sendTransaction = async function(req, res) {
		var transaction = new Transaction(req.body);
		await transation.save((err) => {
         socket.emitMessage()
			if(err) sendStatus(500);
			res.sendStatus(200);
		})
	}
