var logger = require('../../lib/logger');
var passport = require('../../lib/passport');
var dropboxPassport = require('passport-dropbox-oauth2');
var UserStorageAuth = require('../../models/userStorageAuth');
var User = require('../../models/user');

module.exports = function(app) {
  var authFilter = function(req, res, next) {
    if (req.path === '/storages/dropbox/auth') {
      req.session.storagesDropboxAuthRedirectURL = null;
    } else {
      req.session.storagesDropboxAuthRedirectURL = req.path;
    }

    if (typeof req.user === 'undefined') {
      logger.warn('Dropbox storage router filtered request after failing to find user in session');
      res.redirect('/storages/dropbox/auth');
    } else {
      next();
    }
  };

  app.authFilter = authFilter;

  passport.use(new dropboxPassport.Strategy({
      clientID: process.env.SYNC_SERVER_STORAGES_DROPBOX_APP_KEY || logger.fatal('Dropbox storage router failed to find app key in environment'),
      clientSecret: process.env.SYNC_SERVER_STORAGES_DROPBOX_APP_SECRET || logger.fatal('Dropbox storage router failed to find app secret in environment'),
      callbackURL: app.origin + '/storages/dropbox/auth-callback',
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      logger.trace('Dropbox storage router started authenticating Dropbox user', { dropbox_id: profile.id });

      UserStorageAuth.findOrCreate({
        storageId:       'dropbox',
        storageUserId:  profile.id
      }, 
        function(error, userStorageAuth) {
          if (error) {
            logger.error('Dropbox storage router failed to find or create userStorageAuth using Dropbox auth data');
            return done(error);
          }

          userStorageAuth.storageToken = accessToken;

          userStorageAuth.save(function(error) {
            if (error) {
              logger.error('Dropbox storage router failed to save Dropbox token to userStorageAuth', { id: userStorageAuth.id });
              return done(error);
            } else {
              logger.trace('Dropbox storage router saved Dropbox token to userStorageAuth', { id: userStorageAuth.id });
            }

            if (userStorageAuth.userId) {
              User.findOne({ _id: userStorageAuth.userId }, function(error, user) {
                if (error || !user) {
                  logger.error('Dropbox storage router failed to find user using userStorageAuth.userID', { id: userStorageAuth.id, error: error });
                  return done(error);
                }

                return done(error, user);
              });
            } else {
              if (req.user) {
                userStorageAuth.userId = req.user.id;

                userStorageAuth.save(function(error) {
                  logger.trace('Dropbox storage router associated userStorageAuth with session user');

                  return done(error, req.user);
                });
              } else {
                var email;

                if (profile.emails.length) {
                  email = profile.emails[0].value;
                }

                User.create({ 
                  name: profile.displayName,
                  email: email
                }, function(error, user) {
                  if (error || !user) {
                    logger.error('Dropbox storage router failed to create user');
                    return done(error);
                  }

                  userStorageAuth.userId = user.id;

                  userStorageAuth.save(function(error) {
                    logger.trace('Dropbox storage router associated userStorageAuth with new user');

                    return done(error, user);
                  });
                });
              }
            }
          });
        }
      );
    }
  ));

  app.get('/storages/dropbox/auth', function(req, res) {
    if (req.query.redirectURL) {
      req.session.storagesDropboxAuthRedirectURL = req.query.redirectURL;
      logger.trace('Dropbox storage router remembering to redirect after Dropbox auth', { url: req.session.storagesDropboxAuthRedirectURL });
    }

    logger.trace('Dropbox storage router redirecting request to Dropbox auth');
    passport.authenticate('dropbox-oauth2')(req, res);
  }); 

  app.get('/storages/dropbox/auth-callback', function(req, res) {
    passport.authenticate('dropbox-oauth2', function(error, user, info) {
      if (error) {
        logger.error('Dropbox storage router failed Dropbox auth', { error: error });
        res.redirect('/storages/dropbox/auth');
      } else {
        req.logIn(user, function(error) {
          if (error || !user) { 
            logger.error('Dropbox storage router failed to create session after Dropbox auth', { error: error });
            res.redirect('/storages/dropbox/auth');
          } else {
            if (req.session.storagesDropboxAuthRedirectURL) {
              logger.trace('Dropbox storage router redirecting to remembered URL after Dropbox auth', { url: req.session.storagesDropboxAuthRedirectURL });
              var storagesDropboxAuthRedirectURL = req.session.storagesDropboxAuthRedirectURL;
              req.session.storagesDropboxAuthRedirectURL = null;
              res.redirect(storagesDropboxAuthRedirectURL);
            } else {
              res.redirect('/sessions');
            }
          }
        });
      }
    })(req, res);
  });
}