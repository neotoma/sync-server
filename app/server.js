/**
 * Initiate app server
 * @module
 */

require('dotenvs')();
var app = require('./index');
var fs = require('fs');
var https = require('https');
var logger = require('./lib/logger');
var passportSocketIO = require('./lib/passportSocketIO');
var socketEvents = require('./socketEvents');
var socketIO = require('socket.io');

var keyPath = process.env.SYNC_SERVER_CERTS_DIR + '/key';
var certPath = process.env.SYNC_SERVER_CERTS_DIR + '/crt';
var caPath = process.env.SYNC_SERVER_CERTS_DIR + '/ca';

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
}, app).listen(app.port);

logger.info('App server started listening for HTTPS requests', { port: app.port });

server.io = socketIO(server);

server.io.on('connection', function(socket) {
  logger.trace('App server opened WebSocket connection');

  var listeners = socketEvents(app, socket);

  socket.on('disconnect', function() {
    logger.trace('App server closed WebSocket connection');

    Object.keys(listeners).forEach(function(key) {
      app.removeListener(key, listeners[key]);
    });
  });
});

server.io.set('authorization', passportSocketIO);

logger.info('App server started listening for WebSocket connections');