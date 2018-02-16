/**
 * Application
 * @module
 */

var cookieParser = require('cookie-parser'),
  debug = require('app/lib/debug')('app'),
  express = require('express'),
  expressSession = require('express-session'),
  compression = require('compression'),
  morgan = require('app/lib/morgan'),
  passport = require('app/lib/passport'),
  routers = require('app/routers'),
  sessionConfig = require('app/config/session');

var app = express();

app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(compression());
app.use(morgan('App processed request'));
app.use(expressSession({
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

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

routers(app);

debug('done initializing app');
