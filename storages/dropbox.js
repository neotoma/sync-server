module.exports = function(app, passport, User) {
  var logger = require('../logger');
  var dropboxPassport = require('passport-dropbox-oauth2');
  var https = require('https');
  var dropbox = {};

  dropbox.saveFile = function(user, path, content, callback, error) {
    var options = {
      host: 'api-content.dropbox.com',
      path: '/1/files_put/sandbox/' + path + '?access_token=' + user.storages.dropbox.token,
      method: 'PUT'
    };

    try {
      var req = https.request(options, function(res) {
        if (res.statusCode == 401) {
          throw new Error('unauthorized request');
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          try {
            if (callback) {
              var parsedData = JSON.parse(data);
              callback(parsedData);
            }
          } catch(error) {
            logger.error('failed to parse dropbox saveFile response', { data: data });
            
            if (typeof error != 'undefined') {
              error(error);
            }
          }
        });
      }).on('error', function(error) {
        if (typeof error != 'undefined') {
          error(error);
        }
      });

      req.write(content);
      req.end();
    } catch (error) {
      if (typeof error != 'undefined') {
        error(error);
      }
    }
  };

  dropbox.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.storages.dropbox.id) {
      logger.trace('screened request with Dropbox authFilter');

      req.session.storagesDropboxAuthRedirectPath = req.path;
      res.redirect('/storages/dropbox/auth');
    } else {
      next();
    }
  };

  passport.use(new dropboxPassport.Strategy({
      clientID: app.config.storages.dropbox.appKey,
      clientSecret: app.config.storages.dropbox.appSecret,
      callbackURL: app.config.storages.dropbox.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      logger.trace('authenticating Dropbox user', { dropbox_id: profile.id });

      app.model.user.findOrCreate({ "storages.dropbox.id": profile.id }, 
        function(error, user) {
          user.storages.dropbox.token = accessToken;
          user.save(function(error) {
            if (error) {
              logger.warn('failed to save Dropbox token to user', { id: user.id });
            } else {
              logger.trace('saved Dropbox token to user', { id: user.id });
            }

            return done(error, user);
          });
      });
    }
  ));

  app.get('/storages/dropbox/auth', function(req, res) {
    logger.trace('redirecting request to Dropbox auth');
    passport.authenticate('dropbox-oauth2')(req, res);
  }); 

  app.get('/storages/dropbox/auth-callback', function(req, res, next) { 
    passport.authenticate('dropbox-oauth2', function(error, user, info) {
      if (error) {
        logger.warn('Dropbox auth failed', { error: error });
        res.redirect('/storages/dropbox/auth');
      } else {
        req.logIn(user, function(error) {
          if (error) { 
            logger.warn('Dropbox auth session establishment failed', { error: error });
          }
          
          if (req.session.storagesDropboxAuthRedirectPath) {
            res.redirect(req.session.storagesDropboxAuthRedirectPath);
            req.session.storagesDropboxAuthRedirectPath = null;
          } else {
            res.redirect('/storages/dropbox');
          }
        });
      }
    })(req, res, next);
  });

  app.get('/storages/dropbox', dropbox.authFilter, function(req, res) {
    res.json({
      storages: { 
        dropbox: { 
          token: req.user.storages.dropbox.token 
        } 
      } 
    });
  });

  app.get('/storages/dropbox/account/info', dropbox.authFilter, function(req, res) {
    try {
      var options = {
        host: 'api.dropbox.com',
        path: '/1/account/info?access_token=' + req.user.storages.dropbox.token
      };

      _res = res;

      https.get(options, function(res) {
        try {
          if (res.statusCode == 401) {
            throw new Error('unauthorized request');
          }

          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            _res.json({ response: JSON.parse(data) });
          });
        } catch (error) {
          logger.warn('failed to parse dropbox account info', {
            error: error
          });

          _res.json({ error: error.message });
        }
      }).on('error', function(error) {
        logger.warn('failed to retrieve dropbox account info', {
          error: error
        });

        res.json({ error: error.message });
      });
    } catch (error) {
      logger.warn('failed to retrieve dropbox account info', {
        error: error
      });

      res.json({ error: error.message });
    }
  });

  return dropbox;
}