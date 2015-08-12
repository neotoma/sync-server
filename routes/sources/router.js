module.exports = function(app, source) {
  var sourceId = source.id;
  var logger = require('../../lib/logger');
  var passport = require('../../lib/passport');
  var sourcePassport = require('passport-' + sourceId);
  var source = require('../../objects/sources/' + sourceId);

  var UserSourceAuth = require('../../models/user-source-auth');
  var UserStorageAuth = require('../../models/user-storage-auth');
  var User = require('../../models/user');
  var Item = require('../../models/item');

  var itemController = require('../../controllers/item');

  var clientID = source.clientId;
  var clientSecret = source.clientSecret;
  var callbackURL = 'https://' + app.host + '/sources/' + sourceId + '/auth-callback';

  var authFilter = function(req, res, next) {
    if (req.path == '/sources/' + sourceId + '/auth') {
      req.session.sourceAuthRedirectPath = null;
    } else {
      req.session.sourceAuthRedirectPath = req.path;
    }

    if (typeof req.user == 'undefined') {
      logger.trace('screened request with ' + sourceId + ' authFilter; no session user');
      res.redirect('/sources/' + sourceId + '/auth');
    } else {
      UserSourceAuth.findOne({
        user_id:    req.user.id,
        source_id:  sourceId
      }, function(error, userSourceAuth) {
        if (!userSourceAuth) {
          logger.trace('screened request with ' + sourceId + ' authFilter; no user source auth');
          res.redirect('/sources/' + sourceId + '/auth');
        } else {
          next();
        }
      });
    }
  };

  passport.use(new sourcePassport.Strategy({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      logger.trace('authenticating ' + sourceId + ' user', { source_user_id: profile.id });

      UserSourceAuth.findOrCreate({
        user_id:          req.user.id,
        source_id:        sourceId,
        source_user_id:   profile.id
      }, function(error, userSourceAuth) {
        if (error) {
          logger.error('failed to find or create user source auth', { 
            error: error
          });

          done(error);
        }

        userSourceAuth.source_token = accessToken;

        userSourceAuth.save(function(error) {
          if (error) {
            logger.error('failed to save ' + sourceId + ' token to user source auth', { 
              error: error
            });
          } else {
            logger.trace('saved ' + sourceId + ' token to user source auth', { 
              user_id: req.user.id 
            });
          }

          done(error, req.user);
        });
      });
    }
  ));

  app.get('/sources/' + sourceId + '/auth', app.authFilter, function(req, res) {
    if (req.query.redirectURL) {
      req.session.sourceAuthRedirectPath = req.query.redirectURL;
      logger.trace('remember to redirect after ' + sourceId + ' auth', { url: req.session.sourceAuthRedirectPath });
    }

    logger.trace('redirecting request to ' + sourceId + ' auth');
    passport.authenticate(sourceId)(req, res);
  });

  app.get('/sources/' + sourceId + '/auth-callback', app.authFilter, passport.authenticate(sourceId, { 
    failureRedirect: '/sources/' + sourceId + '/auth'
  }), function(req, res) {
    UserStorageAuth.findOne({
      user_id: req.user.id,
    }, function(error, userStorageAuth) {
      if (error) {
        logger.error('failed to find userStorageAuth for user', {
          user_id: user.id,
          error: error
        });
      } else {
        var storage = require('../../objects/storages/' + userStorageAuth.storage_id);
        itemController.syncAllForAllContentTypes(app, req.user, storage, source);
      }

      if (req.session.sourceAuthRedirectPath) {
        res.redirect(req.session.sourceAuthRedirectPath);
        req.session.sourceAuthRedirectPath = null;
      } else {
        res.redirect('/sessions');
      }
    });
  });
}