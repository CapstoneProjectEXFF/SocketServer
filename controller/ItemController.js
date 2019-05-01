var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var tradeController = require('./TradeController');
var userController = require('./UserController');
var Socket = require('../bin/www');
var io = Socket.io;

exports.getSuggestedItems = async function(req, io) {

}

exports.markItem = async function(itemId, room, ownerId) {
   await Item.findOneAndUpdate({'itemId': itemId},
      {'$addToSet': {rooms: room}},
      async (err, item) => {
         if(err) console.log(500, err);
         if(item === null) {
            var item = new Item({itemId: itemId, ownerId: ownerId, rooms:[room]});
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
         console.log(`itemid ${req.itemId} itemFound ${item}`);
         if(item[0] !== undefined) {
            item[0].rooms.map(i => {
               if (i !== req.room) {
                  tradeController.removeItem({
                     room: i, itemId: req.itemId}, io);
               }
            })
            var request = {
               'event': 'remove-from-inv',
               'info': {
                  'itemId': item[0].itemId,
                  'ownerId': item[0].ownerId
               }
            }
            userController.notiUserById(req.userId, io, request)
            //io.to().emit('remove-from-inv', itemInfo);
         }
      })
}
