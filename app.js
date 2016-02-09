var express = require('express');
var https = require('https');
var fs = require('fs');
var compression = require('compression');
var bodyParser = require('body-parser')
var app = express();
var prototype = require('./lib/prototype');

app.use(compression());
app.use(bodyParser.json());

var passportSocketIo = require('passport.socketio');

var logger = require('./lib/logger');
app.use(express.logger({ immediate: true, format: "\033[37m:method :url\033[37m (:date)\033[0m" }));

app.host = process.env.SYNC_HOST || logger.fatal('failed to configure host for app from environment');
app.port = process.env.SYNC_EXPRESS_PORT || 9090;

var MongoStore = new require('connect-mongo')(express);
var store = new MongoStore({
  url: require('./lib/mongodb')().url
});

var secret = process.env.SYNC_SESSIONS_SECRET || logger.fatal('failed to configure sessions secret for app from environment');

app.use(express.cookieParser());
app.use(express.session({ 
  secret: secret,
  store: store
}));

app.use(express.static(__dirname + '/public'));

var passport = require('./lib/passport');
app.use(passport.initialize());
app.use(passport.session());

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'https://' + process.env.SYNC_WEB_HOST);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

require('./routes')(app);

var server = https.createServer({
  key: fs.readFileSync(process.env.SYNC_SSL_KEY, 'utf8'),
  cert: fs.readFileSync(process.env.SYNC_SSL_CRT, 'utf8'),
  ca: fs.readFileSync(process.env.SYNC_SSL_INT_CRT, 'utf8')
}, app).listen(app.port);

logger.trace('started listening for HTTPS requests', { port: app.port });

app.io = require('socket.io')(server);

app.io.on('connection', function(socket) {
  logger.trace('opened WebSocket connection');

  var listeners = require('./socket_events')(app, socket);

  socket.on('disconnect', function() {
    logger.trace('closed WebSocket connection');

    Object.keys(listeners).forEach(function(key) {
      app.removeListener(key, listeners[key]);
    });
  });
});

app.io.set('authorization', passportSocketIo.authorize({
  key: 'connect.sid',
  secret: secret,
  store: store,
  cookieParser: express.cookieParser
}));

logger.trace('started listening for WebSocket connections');