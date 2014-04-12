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

  foursquare.sync = function(user) {
    foursquare.syncCheckins(user);
  };

  foursquare.syncCheckins = function(user) {
    try {
      var offset = 0;

      var syncNextCheckinsPage = function() {
        var options = {
          host: 'api.foursquare.com',
          path: '/v2/users/self/checkins?v=' + apiVersion + '&oauth_token=' + user.sources.foursquare.token + '&limit=250&offset=' + offset,
        };

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

            try {
              if (typeof json.meta.errorType != 'undefined') {
                throw { message: json.meta.errorType + ' - ' + json.meta.errorDetail };
              }

              var checkins = json.response.checkins.items;

              if (checkins.length != 0) {
                while (checkins.length > 0) {
                  foursquare.syncCheckin(user, checkins.shift());
                  offset++;
                }

                syncNextCheckinsPage();
              }
            } catch(e) {
              console.error(e.message);
            }
          });
        }).on('error', function(e) {
          throw e;
        });
      };

      syncNextCheckinsPage();
    } catch (e) {
      console.error(e.message);
    }    
  }

  foursquare.syncCheckin = function(user, checkin) {    
    storages.dropbox.saveFile(
      user, 
      '/sources/foursquare/checkins/' + checkin.id + '.json',
      JSON.stringify(checkin)
    );
  }

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

  app.get('/sources/foursquare/sync', app.authFilter, foursquare.authFilter, function(req, res) {
    try {
      foursquare.syncCheckins(req.user);
      res.json({ msg: 'foursquare sync started' });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  return foursquare;
}