var logger = require('../lib/logger');
var Item = require('../models/item')();
var statusController = require('../controllers/status.js');

module.exports = function(app, socket) {
  var listeners = {};

  var itemSyncVerified = function(item) {
    if (socket.request.user.logged_in && item.userId == socket.request.user.id) {
      logger.trace('itemSyncVerified', { item_id: item.id });

      statusController.json(function(error, data) {
        if (!error) {
          app.io.emit('statusesUpdate', data);
        }
      }, { 
        userId: socket.request.user.id,
        storageId: item.storageId,
        sourceId: item.sourceId,
        contentTypeId: item.contentTypeId
      });
    }
  }

  listeners['itemSyncVerified'] = itemSyncVerified;
  app.on('itemSyncVerified', itemSyncVerified); 

  return listeners;
}