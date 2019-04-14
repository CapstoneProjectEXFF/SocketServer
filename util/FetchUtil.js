var fetch = require('node-fetch');
var Bluebird = require('bluebird');

fetch.Promise = Bluebird;
fetch('http://35.247.191.68:8080/transaction', {
   method: 'POST',
   body: JSON.stringify(transactionWrapper),
   headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': req.token
   }
})
   .then(res => res.text())
   .then(body => {
      var bodyRes = JSON.parse(body);
      var transInfo = {
         transactionId:  bodyRes.message,
         room: req.room
      }
      io.emit("trade-done", transInfo);
      io.emit('send-msg', {sender: -4, msg: req.room})
      console.log('hello im spring: ' + bodyRes.message);
      resetTrade(req, io);
   });
