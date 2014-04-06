module.exports = function(app, passport, storages) {
  var foursquarePassport = require('passport-foursquare');
  var https = require('https');
  var apiVersion = '20140404';
  var foursquare = {};

  foursquare.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.sources.foursquare.token) {
      req.session.sourcesFoursquareAuthRedirectPath = req.path;

      if (req.path == '/sources/foursquare/auth') {
        req.session.sourcesFoursquareAuthRedirectPath = null;
      } else {
        req.session.sourcesFoursquareAuthRedirectPath = req.path;
      }

      res.redirect('/sources/foursquare/auth');
      return;
    }

    next();
  };

  passport.use(new foursquarePassport.Strategy({
      clientID: app.config.sources.foursquare.clientID,
      clientSecret: app.config.sources.foursquare.clientSecret,
      callbackURL: app.config.sources.foursquare.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      req.user.sources.foursquare.id = profile.id;
      req.user.sources.foursquare.token = accessToken;
      req.user.save(function(error) {
        done(null, req.user);
      });
    }
  ));

  app.get('/sources/foursquare/auth', app.authFilter, passport.authenticate('foursquare'));

  app.get('/sources/foursquare/auth-callback', app.authFilter, passport.authenticate('foursquare', { 
    failureRedirect: '/sources/foursquare/auth'
  }), function(req, res) {
    if (req.session.sourcesFoursquareAuthRedirectPath) {
      res.redirect(req.session.sourcesFoursquareAuthRedirectPath);
      req.session.sourcesFoursquareAuthRedirectPath = null;
    } else {
      res.redirect('/sources/foursquare');
    }
  });

  app.get('/sources/foursquare', app.authFilter, foursquare.authFilter, function(req, res) {
    res.json({ 
      sources: { 
        foursquare: {
          token: req.user.sources.foursquare.token 
        } 
      } 
    });
  });

  app.get('/sources/foursquare/checkins', app.authFilter, foursquare.authFilter, function(req, res) {
    var options = {
      host: 'api.foursquare.com',
      path: '/v2/users/self/checkins?v=' + apiVersion + '&oauth_token=' + req.user.sources.foursquare.token
    };

    _res = res;

    try {
      https.get(options, function(res) {
        if (res.statusCode == 401) {
          throw { message: 'Unauthorized request' };
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          var json = JSON.parse(data);

          storages.dropbox.saveFile(
            req.user, 
            'foursquare-checkins.json', 
            data
          );

          _res.json({ response: json });
        });
      }).on('error', function(e) {
        res.json({ error: e.message });
      });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  return foursquare;
}