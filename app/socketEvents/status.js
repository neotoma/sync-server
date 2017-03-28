var app = require('app');
var debug = require('app/lib/debug')('syncServer:socketEvents:status');
var logger = require('app/lib/logger');
var statusController = require('app/controllers/status');

module.exports = function(server, socket) {
  var listeners = {};

  var storedItemData = function(item) {
    debug('listener storedItemData, item: %s, logged_in: %s, item.user.id: %s, socket.request.user.id: %s', item.id, socket.request.user.logged_in, item.user.id, socket.request.user.id);

    if (socket.request.user.logged_in && item.user.id == socket.request.user.id) {
      logger.trace('storedItemData', { itemId: item.id });

      statusController.json(function(error, data) {
        if (error) {
          debug.error('unable to app.io.emit statusUpdate');
        } else {
          server.io.emit('statusesUpdate', data);
          debug('app.io.emit statusUpdate');
        }
      }, { 
        user: socket.request.user.id,
        storage: item.storage.id,
        source: item.source.id,
        contentType: item.contentType.id
      });
    } else {
      debug('socket request user does not match item');
    }
  };

  debug('listening for storedItemData');

  listeners['storedItemData'] = storedItemData;
  app.on('storedItemData', storedItemData); 

  return listeners;
};