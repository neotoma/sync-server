/**
 * Application
 * @module
 */

var express = require('express');
var app = express();
var passport = require('./lib/passport');
var sessionConfig = require('./config/session');
var User = require('./models/user');

app.use(require('cookie-parser')());
app.use(express.static(__dirname + '/public'));
app.use(require('compression')());
app.use(require('./lib/morgan')('App processed request'));
app.use(require('express-session')({
  secret: sessionConfig.secret,
  store: sessionConfig.store,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.host = 'https://' + process.env.SYNC_SERVER_HOST + ':' + process.env.SYNC_SERVER_PORT;

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

require('./routers')(app);

module.exports = app;