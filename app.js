var express = require('express');
var logger = require('./lib/logger');
var passport = require('./lib/passport');
var session = require('./lib/session');
var app = express();

app.use(require('cookie-parser')());
app.use(express.static(__dirname + '/public'));
app.use(require('body-parser').json());
app.use(require('compression')());
app.use(require('./lib/morgan')('App processed request'));
app.use(require('express-session')({
  secret: session.secret,
  store: session.store,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

try {
  if (!process.env.SYNC_HOST) {
    throw new Error('App failed to find host variable from environment');
  }

  if (!process.env.SYNC_PORT) {
    throw new Error('App failed to find port variable from environment');
  }

  app.origin = 'https://' + process.env.SYNC_HOST + ':' + process.env.SYNC_PORT;
  app.port = process.env.SYNC_PORT;
} catch (error) {
  logger.fatal(error.message);
  throw error;
}

require('./routes')(app);

logger.info('App loaded in ' + process.env.NODE_ENV + ' environment');

module.exports = app;