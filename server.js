/**
 * Initiate app server
 * @module
 */

require('./lib/env')();
var app = require('./app');
var fs = require('fs');
var https = require('https');
var logger = require('./lib/logger');
var passportSocketIO = require('./lib/passport-socketio');
var socketEvents = require('./socketEvents');
var socketIO = require('socket.io');

var keyPath = process.env.SYNC_SERVER_CERTS_DIR + '/key';
var certPath = process.env.SYNC_SERVER_CERTS_DIR + '/crt';
var caPath = process.env.SYNC_SERVER_CERTS_DIR + '/ca';

if (!process.env.SYNC_SERVER_HOST) {
  throw new Error('App failed to find host variable from environment');
}

if (!process.env.SYNC_SERVER_PORT) {
  throw new Error('App failed to find port variable from environment');
}

app.port = process.env.SYNC_SERVER_PORT;

if (!fs.existsSync(keyPath)) {
  throw new Error('App server failed to find SSL key file');
}

if (!fs.existsSync(certPath)) {
  throw new Error('App server failed to find SSL certificate file');
}

if (!fs.existsSync(caPath)) {
  throw new Error('App server failed to find SSL intermediate CA certificate file');
}

var server = https.createServer({ 
  key: fs.readFileSync(keyPath, 'utf8'), 
  cert: fs.readFileSync(certPath, 'utf8'), 
  ca: fs.readFileSync(caPath, 'utf8') 
}, app).listen(app.port);

logger.info('App started listening for HTTPS requests', { port: app.port });

app.io = socketIO(server);

app.io.on('connection', function(socket) {
  logger.trace('App opened WebSocket connection');

  var listeners = socketEvents(app, socket);

  socket.on('disconnect', function() {
    logger.trace('App closed WebSocket connection');

    Object.keys(listeners).forEach(function(key) {
      app.removeListener(key, listeners[key]);
    });
  });
});

app.io.set('authorization', passportSocketIO);

logger.info('App started listening for WebSocket connections');