module.exports = function(app, source) {
  var sourceId = source.id;
  var logger = require('../../lib/logger');
  var passport = require('../../lib/passport');
  var sourcePassportStrategy = require('passport-' + sourceId).Strategy;
  var source = require('../../objects/sources/' + sourceId);

  var UserSourceAuth = require('../../models/userSourceAuth');
  var UserStorageAuth = require('../../models/userStorageAuth');
  var User = require('../../models/user');
  var Item = require('../../models/item');

  var itemController = require('../../controllers/item');
  var callbackURL = 'https://' + app.host + '/sources/' + sourceId + '/auth-callback';

  var strategyParams = {
    callbackURL: callbackURL,
    passReqToCallback: true
  };

  var clientId = process.env['SYNC_SOURCES_' + source.id.toUpperCase() + '_CLIENT_ID'];
  var clientSecret = process.env['SYNC_SOURCES_' + source.id.toUpperCase() + '_CLIENT_SECRET'];
  var consumerKey = process.env['SYNC_SOURCES_' + source.id.toUpperCase() + '_CONSUMER_KEY'];
  var consumerSecret = process.env['SYNC_SOURCES_' + source.id.toUpperCase() + '_CONSUMER_SECRET'];

  if (clientId && clientSecret) {
    strategyParams.clientID = clientId;
    strategyParams.clientSecret = clientSecret;
  } else if (consumerKey && consumerSecret) {
    strategyParams.consumerKey = consumerKey;
    strategyParams.consumerSecret = consumerSecret;
  } else {
    logger.fatal('Passport parameters not provided by environment for ' + source.name + ' config');
  }

  var verifyCallback = function(req, accessToken, refreshToken, profile, done) {
    logger.trace('authenticating ' + sourceId + ' user', { source_userId: profile.id });

    UserSourceAuth.findOrCreate({
      userId:          req.user.id,
      sourceId:        sourceId,
      sourceUserId:   profile.id
    }, function(error, userSourceAuth) {
      if (error) {
        logger.error('failed to find or create user source auth', { 
          error: error
        });

        done(error);
      }

      userSourceAuth.sourceToken = accessToken;

      userSourceAuth.save(function(error) {
        if (error) {
          logger.error('failed to save ' + sourceId + ' token to user source auth', { 
            error: error
          });
        } else {
          logger.trace('saved ' + sourceId + ' token to user source auth', { 
            userId: req.user.id 
          });
        }

        done(error, req.user);
      });
    });
  };

  if (source.clientId && source.clientSecret) {
    var strategy = new sourcePassportStrategy({
      clientID: source.clientId,
      clientSecret: source.clientSecret,
      callbackURL: callbackURL,
      passReqToCallback: true
    }, verifyCallback);
  } else if (source.consumerKey && source.consumerSecret) {
    var strategy = new sourcePassportStrategy({
      consumerKey: source.consumerKey,
      consumerSecret: source.consumerSecret,
      callbackURL: callbackURL,
      passReqToCallback: true
    }, verifyCallback);
  } else {
    logger.fatal('failed to find auth tokens for ' + sourceId);
  }

  passport.use(strategy);

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
      userId: req.user.id,
    }, function(error, userStorageAuth) {
      if (error) {
        logger.error('failed to find userStorageAuth for user', {
          userId: user.id,
          error: error
        });
      } else {
        var storage = require('../../objects/storages/' + userStorageAuth.storageId);
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