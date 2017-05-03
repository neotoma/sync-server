/**
 * Initiate app server
 * @module
 */

var ranger = require('park-ranger')();
var app = require('app');
var debug = require('app/lib/debug')('syncServer:server');
var https = require('https');
var logger = require('app/lib/logger');
var passportSocketIO = require('app/lib/passportSocketIO');
var socketEvents = require('app/socketEvents');
var socketIO = require('socket.io');

var server = https.createServer(ranger.cert, app).listen(app.port, function() {
  logger.info('App server started listening for HTTPS requests', { port: app.port });
});

server.io = socketIO(server);

server.io.on('connection', function(socket) {
  debug('opened socket.io connection');

  var listeners = socketEvents(server, socket);

  debug('listeners count: %s', Object.keys(listeners).length);

  socket.on('disconnect', function() {
    debug('closed socket.io connection');

    Object.keys(listeners).forEach(function(key) {
      app.removeListener(key, listeners[key]);
    });
  });
});

server.io.use(passportSocketIO);

logger.info('App server started listening for WebSocket connections');