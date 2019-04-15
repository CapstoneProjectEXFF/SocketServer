var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var tradeController = require('./TradeController');
var Socket = require('../bin/www');
var io = Socket.io;

exports.getSuggestedItems = async function(req, io) {

}

exports.markItem = async function(itemId, room, userId) {
   await Item.findOneAndUpdate({'itemId': itemId},
      {'$addToSet': {rooms: room}},
      async (err, item) => {
         if(err) console.log(500, err);
         if(item === null) {
            var item = new Item({itemId: itemId, userId: userId, rooms:[room]});
            await item.save((err) => {
               console.log('item saved');
               if(err) console.log(500);
            })
         }
      }
   )
}

exports.unmarkItem = async function(itemId, room) {
   await Item.update({'itemId': itemId},
      {'$pull': {rooms: room}},
      (err) => {
         if(err) console.log(500, err);
      }
   )
}

exports.notifyItemUnavailable = async function(req, io) {
   await Item.find({'itemId': req.itemId},
      function(err, item) {
         item.rooms.map(i => {
            tradeController.removeItem({room: i, itemId: req.itemId, userId: userId}, io);
         })
      })
}
