var foursquareConfig = {
  'secrets' : {
    'clientId' : process.env.FOURSQUARE_CLIENT_ID,
    'clientSecret' : process.env.FOURSQUARE_CLIENT_SECRET,
    'redirectUrl' : 'http://localhost:9090/sources/foursquare/callback'
  }
}

var foursquare = require('node-foursquare')(foursquareConfig);

exports.auth = function(req, res) {
  res.writeHead(303, { 'location' : foursquare.getAuthClientRedirectUrl() });
  res.end();
}

exports.callback = function(req, res) {
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
}

exports.checkins = function(req, res) {
  if (!req.cookies.foursquareAccessToken) {
    res.redirect('/sources/foursquare/auth');
  }

  foursquare.Users.getCheckins('self', {}, req.cookies.foursquareAccessToken, 
    function(error, results) {
      res.json(results);
    }
  );
}