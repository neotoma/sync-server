var app = require('./app');
var fs = require('fs');
var logger = require('./lib/logger');

try {
  if (!process.env.SYNC_SSL_KEY) {
    throw new Error('App server failed to find SSL key file path variable in environment');
  }

  if (!process.env.SYNC_SSL_CRT) {
    throw new Error('App server failed to find SSL certificate file path variable in environment');
  }

  if (!process.env.SYNC_SSL_INT_CRT) {
    throw new Error('App server failed to find SSL intermediate CA certificate file path variable in environment');
  }

  var server = require('https').createServer({
    key: fs.readFileSync(process.env.SYNC_SSL_KEY, 'utf8'),
    cert: fs.readFileSync(process.env.SYNC_SSL_CRT, 'utf8'),
    ca: fs.readFileSync(process.env.SYNC_SSL_INT_CRT, 'utf8')
  }, app).listen(app.port);
} catch (error) {
  logger.fatal(error.message);
  throw error;
}

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