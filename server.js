console.log('Starting sync app server');

var foursquareConfig = {
  'secrets' : {
    'clientId' : process.env.FOURSQUARE_CLIENT_ID,
    'clientSecret' : process.env.FOURSQUARE_CLIENT_SECRET,
    'redirectUrl' : 'http://localhost:9090/sources/foursquare/callback'
  }
}

var foursquare = require('node-foursquare')(foursquareConfig);
var express = require('express');
var app = express();
app.use(express.cookieParser());

var server = app.listen();

app.get('/sources/foursquare/auth', function(req, res) {
  res.writeHead(303, { 'location' : foursquare.getAuthClientRedirectUrl() });
  res.end();
});

app.get('/sources/foursquare/callback', function(req, res) {
  foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if (error) {
      res.json({ error: error.message });
    } else {
      res.cookie('foursquareAccessToken', accessToken);
      res.redirect('/sources/foursquare/checkins');
    }
  });
});

app.get('/sources/foursquare/checkins', function(req, res) {
  if (!req.cookies.foursquareAccessToken) {
    res.redirect('/sources/foursquare/auth');
  }

  foursquare.Users.getCheckins('self', {}, req.cookies.foursquareAccessToken, 
    function(error, results) {
      res.json(results);
    }
  );
});

module.exports = app;

console.log('Sync app server started');