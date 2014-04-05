var express = require('express');
var app = express();
var port = process.env.PORT || 9090;
var mongoose = require('./mongoose');
var passport = require('./passport')(mongoose);

app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.session({ secret: process.env.ASHEVILLE_SYNC_EXPRESS_SESSION_SECRET }));
app.use(passport.initialize());
app.use(passport.session());

var dropbox = require('./dropbox')(app, passport, mongoose);
var storages = {
  dropbox: dropbox
};

var foursquare = require('./foursquare')(app, passport, mongoose, storages);

var server = app.listen(port);