var EventEmitter = require('events').EventEmitter;
var logger = require('./lib/logger');
var Item = require('./models/item');

module.exports = function(server) {
  var io = require('socket.io')(server);

  logger.info('listening with socket.io');

  io.on('connection', function(socket) {
    var itemsStream = Item.findOne({}).sort({ sync_verified_at: -1 }).stream();

    itemsStream.on('data', function(item) {
      console.log('itemsStream', { items: item });
      socket.emit('itemsStream', { items: item });
    });
  });

  var ee = new EventEmitter();
  ee.on('itemSyncVerified', function(item) {
    console.log('itemSyncVerified!', item);
  });
}