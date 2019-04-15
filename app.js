var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dbUrl = 'mongodb://kenkej:a123456@ds123584.mlab.com:23584/exff';

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//schema impl and connect to mlab
var mongoose = require('mongoose');
var
   Item = require('./model/ItemModel');
   Trade = require('./model/TradeModel');
   Transaction = require('./model/TransactionModel');

mongoose.connect(dbUrl, (err) => {
	console.log('mlab connected',err);
})

//io path
//io.on('connection', socket =>{
//	socket.emit('yes', 'hieu');
//	console.log('a user is connected')
//})
//io.on('yes', (data) => {
//	console.log('toi la hieune', data);
//});

//route impl
//var ItemRoute = require('./routes/MessageRoute');
//ItemRoute(app);
var TradeRoute = require('./routes/TradeRoute');
TradeRoute(app);
var ItemRoute = require('./routes/ItemRoute');
ItemRoute(app);

module.exports = app;
