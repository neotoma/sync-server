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

var httpPort = process.env.SYNC_SERVER_HTTP_PORT ? process.env.SYNC_SERVER_HTTP_PORT : 9001;
var httpsPort = process.env.SYNC_SERVER_HTTPS_PORT ? process.env.SYNC_SERVER_HTTPS_PORT : 9002;

var httpServer = http.createServer(app).listen(httpPort, () => {
  debug('App server started listening for HTTP requests', { port: httpPort });
});

var httpsServer = https.createServer(ranger.cert, app).listen(httpsPort, () => {
  debug('App server started listening for HTTPS requests', { port: httpsPort });
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
