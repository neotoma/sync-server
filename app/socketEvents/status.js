var Item = require('app/models/item');
var logger = require('app/lib/logger');
var statusController = require('app/controllers/status.js');

module.exports = function(app, socket) {
  var listeners = {};

  var storedItemData = function(item) {
    if (socket.request.user.logged_in && item.user == socket.request.user.id) {
      logger.trace('storedItemData', { itemId: item.id });

      statusController.json(function(error, data) {
        if (!error) {
          app.io.emit('statusesUpdate', data);
        }
      }, { 
        user: socket.request.user.id,
        storage: item.storage.id,
        source: item.source.id,
        contentType: item.contentType.id
      });
    }
  }

  listeners['storedItemData'] = storedItemData;
  app.on('storedItemData', storedItemData); 

  return listeners;
}