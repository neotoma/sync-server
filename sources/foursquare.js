module.exports = function(app, passport, storages) {
  var foursquarePassport = require('passport-foursquare');
  var https = require('https');
  var apiVersion = '20140404';
  var foursquare = {};

  foursquare.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.sources.foursquare.token) {
      req.session.foursquareAuthRedirect = req.path;
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
      if (req.user) {
        req.user.sources.foursquare.token = accessToken;
        req.user.save(function(error) {
          done(null, req.user);
        });
      } else {
        return done(null, { 
          sources: { 
            foursquare: { 
              token: accessToken 
            } 
          }
        });
      }
    }
  ));

  app.get('/sources/foursquare/auth', passport.authenticate('foursquare'));

  app.get('/sources/foursquare/auth-callback', passport.authenticate('foursquare', { 
    failureRedirect: '/sources/foursquare/auth'
  }), function(req, res) {
    if (req.session.foursquareAuthRedirect) {
      res.redirect(req.session.foursquareAuthRedirect);
      req.session.foursquareAuthRedirect = null;
    } else {
      res.redirect('/sources/foursquare');
    }
  });

  app.get('/sources/foursquare', foursquare.authFilter, function(req, res) {
    res.json({ 
      sources: { 
        foursquare: {
          token: req.user.sources.foursquare.token 
        } 
      } 
    });
  });

  app.get('/sources/foursquare/checkins', foursquare.authFilter, storages.dropbox.authFilter, function(req, res) {
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