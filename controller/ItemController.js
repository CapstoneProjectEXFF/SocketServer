var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var Socket = require('../bin/www');
var io = Socket.io;

exports.getSuggestedItems = async function(req, io) {

}

exports.markItem = async function(itemId, room) {
   await Item.findOneAndUpdate({'itemId': itemId},
      {'$addToSet': {rooms: room}},
      async (err, item) => {
         if(err) console.log(500, err);
         if(item === null) {
            var item = new Item({itemId: itemId, rooms:[room]});
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

exports.notifItemUnavailable = async function() {
   await Item.find({'itemId': req.query.userId},
      {'_id': 0, 'users._id': 0}, {activeTime: 'desc'}, function(err, trades) {
         res.send(trades);
      })
}
