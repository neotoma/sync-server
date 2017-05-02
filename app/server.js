/**
 * Initiate app server
 * @module
 */

require('park-ranger')();
var app = require('app');
var debug = require('app/lib/debug')('syncServer:server');
var fs = require('fs');
var https = require('https');
var logger = require('app/lib/logger');
var passportSocketIO = require('app/lib/passportSocketIO');
var path = require('path');
var socketEvents = require('app/socketEvents');
var socketIO = require('socket.io');

var caPath = path.resolve(process.env.SYNC_SERVER_CERTS_DIR, 'ca');
var certPath = path.resolve(process.env.SYNC_SERVER_CERTS_DIR, 'crt');
var keyPath = path.resolve(process.env.SYNC_SERVER_CERTS_DIR, 'key');

if (!fs.existsSync(caPath)) {
  throw new Error('App server failed to find SSL intermediate CA certificate file');
}

if (!fs.existsSync(certPath)) {
  throw new Error('App server failed to find SSL certificate file');
}

if (!fs.existsSync(keyPath)) {
  throw new Error('App server failed to find SSL key file');
}

var server = https.createServer({ 
  ca: fs.readFileSync(caPath, 'utf8'),
  cert: fs.readFileSync(certPath, 'utf8'),
  key: fs.readFileSync(keyPath, 'utf8')
}, app).listen(app.port, function() {
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