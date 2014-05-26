module.exports = function(app, passport, storages) {
  var logger = require('../logger');
  var foursquarePassport = require('passport-foursquare');
  var https = require('https');
  var apiVersion = '20140404';
  var foursquare = {};

  foursquare.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.sources.foursquare.token) {
      logger.trace('screened request with foursquare authFilter');

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
    foursquare.syncItems(user, 'checkins');
    foursquare.syncItems(user, 'tips');
    foursquare.syncItems(user, 'friends');
  };

  foursquare.syncItems = function(user, aspect) {
    logger.trace('starting foursquare items sync', { 
      user_id: user.id, 
      aspect: aspect 
    });

    try {
      var offset = 0;

      var syncNextPage = function() {
        logger.trace('syncing foursquare next page of items', { 
          user_id: user.id, 
          aspect: aspect,
          offset: offset
        });

        var options = {
          host: 'api.foursquare.com',
          path: '/v2/users/self/' + aspect + '?v=' + apiVersion + '&oauth_token=' + user.sources.foursquare.token + '&limit=250&offset=' + offset,
        };

        https.get(options, function(res) {
          if (res.statusCode == 401) {
            throw new Error('unauthorized request');
          }

          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            var json = JSON.parse(data);

            try {
              if (typeof json.meta.errorType != 'undefined') {
                throw new Error(json.meta.errorType + ' - ' + json.meta.errorDetail);
              }

              var items = json.response[aspect].items;

              logger.trace('retrieved foursquare next page of items', { 
                user_id: user.id, 
                aspect: aspect,
                offset: offset,
                total: items.length
              });

              if (items.length != 0) {
                while (items.length > 0) {
                  foursquare.syncItem(user, aspect, items.shift());
                  offset++;
                }

                syncNextPage();
              } else {
                logger.trace('finished starting foursquare items sync', { 
                  user_id: user.id, 
                  aspect: aspect
                });
              }
            } catch(e) {
              logger.warn(e.message);
            }
          });
        }).on('error', function(e) {
          logger.warn(e.message);
        });
      };

      syncNextPage();
    } catch (e) {
      logger.warn(e.message);
    }    
  }

  foursquare.syncItem = function(user, aspect, item) { 
    logger.trace('syncing foursquare item', { 
      user_id: user.id, 
      aspect: aspect,
      item: item.id
    });

    storages.dropbox.saveFile(
      user, 
      '/sources/foursquare/' + aspect + '/' + item.id + '.json',
      JSON.stringify(item),
      function(response) {
        logger.trace('synced foursquare item', { 
          user_id: user.id, 
          aspect: aspect,
          item: item.id,
          response: response
        });
      },
      function(e) {
        logger.warn('syncing foursquare item failed', { 
          user_id: user.id, 
          aspect: aspect,
          item: item.id,
          message: e.message
        });
      }
    );
  }

  passport.use(new foursquarePassport.Strategy({
      clientID: app.config.sources.foursquare.clientID,
      clientSecret: app.config.sources.foursquare.clientSecret,
      callbackURL: app.config.sources.foursquare.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      logger.trace('authenticating foursquare user', { foursquare_id: profile.id });

      req.user.sources.foursquare.id = profile.id;
      req.user.sources.foursquare.token = accessToken;
      req.user.save(function(error) {
        logger.trace('saved foursquare ID and token to user', { 
          user_id: req.user.id 
        });

        done(null, req.user);
      });
    }
  ));

  app.get('/sources/foursquare/auth', app.authFilter, function(req, res) {
    logger.trace('redirecting request to foursquare auth');
    passport.authenticate('foursquare')(req, res);
  });

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

  app.get('/sources/foursquare/sync/:aspect', app.authFilter, foursquare.authFilter, function(req, res) {
    try {
      var aspect = req.params.aspect;
      foursquare.syncItems(req.user, aspect);
      res.json({ msg: 'foursquare ' + aspect + ' sync started' });
    } catch (e) {
      logger.warn(e.message);
      res.json({ error: e.message });
    }
  });

  return foursquare;
}