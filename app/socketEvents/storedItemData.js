var app = require('app');
var debug = require('app/lib/debug')('syncServer:socketEvents:status');
var jsonapi = require('app/lib/jsonapi');

module.exports = function(server, socket) {
  var emit = function(item, job) {
    debug('storedItemData emit item: %s, job: %s, logged_in: %s, item.user.id: %s, socket.request.user.id: %s',
      item.id, job.id, socket.request.user.logged_in, item.user.id, socket.request.user.id);

    if (!socket.request.user.logged_in || item.user.id != socket.request.user.id) {
      return;
    }

    server.io.emit('item', jsonapi.responseDocument(jsonapi.resourceObjectFromDocument(item)));
    server.io.emit('job', jsonapi.responseDocument(jsonapi.resourceObjectFromDocument(job)));
  };

  debug('listening for storedItemData');

  app.on('storedItemData', emit); 

  return { 'storedItemData': emit };
};
