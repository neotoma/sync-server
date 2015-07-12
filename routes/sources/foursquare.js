module.exports = function(app) {
  var logger = require('../../lib/logger');
  var passport = require('../../lib/passport');
  var foursquarePassport = require('passport-foursquare');
  var foursquare = require('../../objects/sources/foursquare');

  var UserSourceAuth = require('../../models/user-source-auth');
  var UserStorageAuth = require('../../models/user-storage-auth');
  var User = require('../../models/user');
  var Item = require('../../models/item');

  var itemController = require('../../controllers/item');

  var clientID = process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID || logger.crit('Client ID not provided by environment for foursquare config');
  var clientSecret = process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.crit('Client secret not provided by environment for foursquare config');
  var callbackURL = 'https://' + app.host + '/sources/foursquare/auth-callback';

  var authFilter = function(req, res, next) {
    if (req.path == '/sources/foursquare/auth') {
      req.session.sourcesFoursquareAuthRedirectPath = null;
    } else {
      req.session.sourcesFoursquareAuthRedirectPath = req.path;
    }

    if (typeof req.user == 'undefined') {
      logger.trace('screened request with foursquare authFilter; no session user');
      res.redirect('/sources/foursquare/auth');
    } else {
      UserSourceAuth.findOne({
        user_id:    req.user.id,
        source_id:  "foursquare"
      }, function(error, userSourceAuth) {
        if (!userSourceAuth) {
          logger.trace('screened request with foursquare authFilter; no user source auth');
          res.redirect('/sources/foursquare/auth');
        } else {
          next();
        }
      });
    }
  };

  passport.use(new foursquarePassport.Strategy({
      clientID: clientID,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      logger.trace('authenticating foursquare user', { foursquare_id: profile.id });

      UserSourceAuth.findOrCreate({
        user_id:          req.user.id,
        source_id:        "foursquare",
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
            logger.error('failed to save foursquare token to user source auth', { 
              error: error
            });
          } else {
            logger.trace('saved foursquare token to user source auth', { 
              user_id: req.user.id 
            });
          }

          done(error, req.user);
        });
      });
    }
  ));

  app.get('/sources/foursquare/auth', app.authFilter, function(req, res) {
    if (req.query.redirectURL) {
      req.session.sourcesFoursquareAuthRedirectPath = req.query.redirectURL;
      logger.trace('remember to redirect after foursquare auth', { url: req.session.sourcesFoursquareAuthRedirectPath });
    }

    logger.trace('redirecting request to foursquare auth');
    passport.authenticate('foursquare')(req, res);
  });

  app.get('/sources/foursquare/auth-callback', app.authFilter, passport.authenticate('foursquare', { 
    failureRedirect: '/sources/foursquare/auth'
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
        itemController.syncAllForAllContentTypes(app, req.user, storage, foursquare);
      }

      if (req.session.sourcesFoursquareAuthRedirectPath) {
        res.redirect(req.session.sourcesFoursquareAuthRedirectPath);
        req.session.sourcesFoursquareAuthRedirectPath = null;
      } else {
        res.redirect('/sessions');
      }
    });
  });

  return foursquare;
}