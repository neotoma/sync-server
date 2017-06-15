/**
 * Initiate app server
 * @module
 */

var ranger = require('park-ranger')();
var app = require('app');
var debug = require('app/lib/debug')('syncServer:server');
var http = require('http');
var https = require('https');
var passportSocketIO = require('app/lib/passportSocketIO');
var socketEvents = require('app/socketEvents');
var socketIO = require('socket.io');

var httpsServer = https.createServer(ranger.cert, app).listen(process.env.SYNC_SERVER_HTTPS_PORT, () => {
  debug('App server started listening for HTTPS requests', { port: process.env.SYNC_SERVER_HTTPS_PORT });
});

var httpServer = http.createServer(app).listen(process.env.SYNC_SERVER_HTTP_PORT, () => {
  debug('App server started listening for HTTP requests', { port: process.env.SYNC_SERVER_HTTP_PORT });
});

var servers = {
  'https': httpsServer, 
  'http': httpServer
};

Object.keys(servers).forEach((key) => {
  var server = servers[key];
  server.io = socketIO(server);

  server.io.on('connection', (socket) => {
    debug('opened socket.io connection for %s', key);

    var listeners = socketEvents(server, socket);

    debug('listeners count for %s: %s', key, Object.keys(listeners).length);

    socket.on('disconnect', () => {
      debug('closed socket.io connection for %s', key);

      Object.keys(listeners).forEach(function(key) {
        app.removeListener(key, listeners[key]);
      });
    });
  });

  server.io.use(passportSocketIO);

  debug('App server started listening for WebSocket connections for %s', key);
});
