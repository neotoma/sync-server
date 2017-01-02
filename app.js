require('./lib/env');

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

app.host = 'https://' + process.env.SYNC_SERVER_HOST + ':' + process.env.SYNC_SERVER_PORT;

require('./routers')(app);

logger.info('App loaded in ' + process.env.SYNC_SERVER_ENV + ' environment');

module.exports = app;