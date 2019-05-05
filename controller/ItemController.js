var mongoose = require('mongoose');
var Item = mongoose.model('Item');
var tradeController = require('./TradeController');
var userController = require('./UserController');
var itemController = require('./ItemController');
var Socket = require('../bin/www');
var io = Socket.io;
var Client  = require('@elastic/elasticsearch')
var client = new Client.Client({ node: 'http://35.247.191.68:9200' })

exports.getItems = async function(req, res) {
   itemController.getSuggestedItems(req);
}

exports.getSuggestedItems = async function(req, res) {
   await client.search({
      index: 'exff_els',
      type: 'item',
      body: {
         query: {
            match: {
               'user_id': req.params.userId
            }
         }
      }
   }).then(response => {
      var result = response.body.hits;
      var dataset = result.hits.map(hit => hit._source.prefer_items);
      return dataset
   }).then(async (i) => {
      var items = [];
      var itemFound = i.map(async (name) => {
         console.log(name)
         await client.search({
            index: 'exff_els',
            type: 'item',
            body: {
               query: {
                  match: {
                     'name': name
                  }
               }
            }
         }).then(resp => {
            var resu = resp.body.hits;
            var dataSet = resu.hits.map(hit => {
               return {id : hit._source.id, name : hit._source.name};
            });
            items = items.concat(dataSet);
         }) 
      })
      Promise.all(itemFound).then(() => {
         var top12Items = items.slice(0,11);
         res.send(top12Items);
      })
   })
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
                     ownerId: item[0].ownerId,
                     room: i, itemId: req.itemId, userId: -1,
                     removeInv: 1}, io);
               }
            })
            //userController.notiUserById(item[0].owerId, io, request)
         }
      })
}
