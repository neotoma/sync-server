var express = require('express')
  , app = express()
  , foursquare = require('./foursquare');

app.use(express.cookieParser());

var server = app.listen(process.env.PORT);

// foursquare
app.get('/sources/foursquare/auth', foursquare.auth);
app.get('/sources/foursquare/callback', foursquare.callback);
app.get('/sources/foursquare/checkins', foursquare.checkins);

module.exports = app;