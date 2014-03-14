var express = require('express')
  , app = express()
  , dropbox = require('./dropbox')
  , foursquare = require('./foursquare');

app.use(express.cookieParser());

var server = app.listen(process.env.PORT);

// Dropbox
app.get('/storages/dropbox/auth', dropbox.auth);

// foursquare
app.get('/sources/foursquare/auth', foursquare.auth);
app.get('/sources/foursquare/callback', foursquare.callback);
app.get('/sources/foursquare/checkins', foursquare.checkins);

module.exports = app;