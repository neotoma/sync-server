module.exports = function(app, passport, mongoose) {
  var User = require('./models/user')(mongoose);
  
  var foursquare = require('node-foursquare')({
    secrets : {
      clientId : process.env.ASHEVILLE_SYNC_FOURSQUARE_CLIENT_ID,
      clientSecret : process.env.ASHEVILLE_SYNC_FOURSQUARE_CLIENT_SECRET,
      redirectUrl : 'http://localhost:9090/sources/foursquare/auth-callback'
    }
  });

  app.get('/sources/foursquare/auth', function(req, res) {
    res.writeHead(303, { 'location' : foursquare.getAuthClientRedirectUrl() });
    res.end();
  });

  app.get('/sources/foursquare/auth-callback', function(req, res) {
    foursquare.getAccessToken({
      code: req.query.code
    }, function (error, accessToken) {
      console.log('callback pass:', error, accessToken);

      if (error) {
        res.json({ error1: error.message });
      } else {
        User.findOrCreate({ sources: { foursquare: { token: accessToken } } }, function(error, user) {
          console.log('User.findOrCreate callback');

          if (error) {
            res.json({ error2: error.message });
          } else {
            res.redirect('/sources/foursquare');
          }
        });
      }
    });
  });

  app.get('/sources/foursquare', function(req, res) {
    if (!req.user || !req.user.sources.foursquare.token) {
      res.json({ error: 'No foursquare token available in session user' });
    }

    foursquare.Users.getCheckins('self', {}, req.cookies.foursquareAccessToken, 
      function(error, results) {
        res.json(results);
      }
    );
  });
}