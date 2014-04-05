var express = require('express');
var app = express();
app.config = require('./config');

var mongoose = require('./mongoose');
var User = require('./models/user')(mongoose);
var passport = require('./passport')(User);

app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({ secret: app.config.session.secret }));
app.use(passport.initialize());
app.use(passport.session());

var storages = require('./storages')(app, passport);
var sources = require('./sources')(app, passport, storages);

var server = app.listen(app.config.port);

console.log('listening on', app.config.port);