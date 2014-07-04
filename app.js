var express = require('express');
var app = express();

var logger = require('./lib/logger');
app.use(express.logger({ immediate: true, format: "\033[37m:method :url\033[37m (:date)\033[0m" }));

app.host = process.env.ASHEVILLE_SYNC_HOST || logger.crit('Host not provided by environment for app config');
app.port = process.env.ASHEVILLE_SYNC_EXPRESS_PORT || 9090;

app.use(express.cookieParser());
app.use(express.session({ 
  secret: process.env.ASHEVILLE_SYNC_SESSIONS_SECRET || logger.crit('Sessions secret not provided by environment for app config'),
  store: new require('connect-mongo')(express)({
    url: require('./lib/mongodb').url
  })
}));

var passport = require('./lib/passport');
app.use(passport.initialize());
app.use(passport.session());

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:9091');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

require('./routes')(app);

var server = app.listen(app.port);
logger.info('listening on', app.port);