var express = require('express');
var https = require('https');
var fs = require('fs');
var compression = require('compression');
var app = express();

app.use(compression());

var passportSocketIo = require('passport.socketio');

var logger = require('./lib/logger');
app.use(express.logger({ immediate: true, format: "\033[37m:method :url\033[37m (:date)\033[0m" }));

app.host = process.env.ASHEVILLE_SYNC_HOST || logger.crit('Host not provided by environment for app config');
app.port = process.env.ASHEVILLE_SYNC_EXPRESS_PORT || 9090;

var MongoStore = new require('connect-mongo')(express);
var store = new MongoStore({
  url: require('./lib/mongodb').url
});

var secret = process.env.ASHEVILLE_SYNC_SESSIONS_SECRET || logger.crit('Sessions secret not provided by environment for app config');

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
  res.header('Access-Control-Allow-Origin', 'https://' + process.env.ASHEVILLE_SYNC_WEB_HOST);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

require('./routes')(app);

var server = https.createServer({
  key: fs.readFileSync(process.env.ASHEVILLE_SYNC_SSL_KEY, 'utf8'),
  cert: fs.readFileSync(process.env.ASHEVILLE_SYNC_SSL_CRT, 'utf8')
}, app).listen(app.port);

logger.info('listening on', app.port);

app.io = require('socket.io')(server);

app.io.on('connection', function(socket) {
  require('./socket_events')(app, socket);
});

app.io.set('authorization', passportSocketIo.authorize({
  key: 'connect.sid',
  secret: secret,
  store: store,
  cookieParser: express.cookieParser
}));

logger.info('listening for socket events');