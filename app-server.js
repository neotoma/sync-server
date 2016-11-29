var app = require('./app');
var fs = require('fs');
var logger = require('./lib/logger');

var keyPath = process.env.SYNC_SERVER_CERTS_DIR + '/key';
var certPath = process.env.SYNC_SERVER_CERTS_DIR + '/crt';
var caPath = process.env.SYNC_SERVER_CERTS_DIR + '/ca-bundle';

try {
  if (!fs.existsSync(keyPath)) {
    throw new Error('App server failed to find SSL key file');
  }

  if (!fs.existsSync(certPath)) {
    throw new Error('App server failed to find SSL certificate file');
  }

  if (!fs.existsSync(caPath)) {
    throw new Error('App server failed to find SSL intermediate CA certificate file');
  }

  var server = require('https').createServer({ 
    key: fs.readFileSync(keyPath, 'utf8'), 
    cert: fs.readFileSync(certPath, 'utf8'), 
    ca: fs.readFileSync(caPath, 'utf8') 
  }, app).listen(app.port);

  logger.info('App started listening for HTTPS requests', { port: app.port });

  app.io = require('socket.io')(server);

  app.io.on('connection', function(socket) {
    logger.trace('App opened WebSocket connection');

    var listeners = require('./socket_events')(app, socket);

    socket.on('disconnect', function() {
      logger.trace('App closed WebSocket connection');

      Object.keys(listeners).forEach(function(key) {
        app.removeListener(key, listeners[key]);
      });
    });
  });

  app.io.set('authorization', require('./lib/passport-socketio'));

  logger.info('App started listening for WebSocket connections');
} catch (error) {
  logger.fatal(error.message);
  throw error;
}