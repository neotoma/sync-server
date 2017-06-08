/**
 * Application
 * @module
 */

var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');
var compression = require('compression');
var morgan = require('app/lib/morgan');
var passport = require('app/lib/passport');
var routers = require('app/routers');
var sessionConfig = require('app/config/session');

var app = express();

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(compression());
app.use(morgan('App processed request'));
app.use(expressSession({
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

if (!process.env.SYNC_SERVER_HOST) {
  throw new Error('App failed to find host variable from environment');
}

app.host = 'https://' + process.env.SYNC_SERVER_HOST + ':' + process.env.SYNC_SERVER_PORT;

if (!process.env.SYNC_SERVER_PORT) {
  throw new Error('App failed to find port variable from environment');
}

app.port = process.env.SYNC_SERVER_PORT;

app.requireAdminAuthentication = function(req, res, next) {
  if (!req.user || !req.user.id || !req.user.admin) {
    res.status(403).send('403 Forbidden');
  } else {
    next();
  }
};

app.requireAuthentication = function(req, res, next) {
  if (typeof req.user === 'undefined') {
    res.status(403).send('403 Forbidden');
  } else {
    next();
  }
};

module.exports = app;

routers();