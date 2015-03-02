var logger = require('../lib/logger');
var Item = require('../models/item');
var statusController = require('../controllers/status.js');

module.exports = function(app, socket) {
  var listeners = {};

  var itemSyncVerified = function(item) {
    if (socket.request.user.logged_in && item.user_id == socket.request.user.id) {
      logger.trace('itemSyncVerified', { item_id: item.id });

      statusController.json(function(error, data) {
        if (!error) {
          app.io.emit('statusesUpdate', data);
        }
      }, { 
        user_id: socket.request.user.id,
        storage_id: item.storage_id,
        source_id: item.source_id,
        content_type_id: item.content_type_id
      });
    }
  }

  listeners['itemSyncVerified'] = itemSyncVerified;
  app.on('itemSyncVerified', itemSyncVerified); 

  return listeners;
}