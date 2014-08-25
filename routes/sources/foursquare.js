module.exports = function(app) {
  var logger = require('../../lib/logger');
  var passport = require('../../lib/passport');
  var foursquarePassport = require('passport-foursquare');
  var foursquare = require('../../controllers/sources/foursquare');

  var UserSourceAuth = require('../../models/user-source-auth');
  var UserStorageAuth = require('../../models/user-storage-auth');
  var User = require('../../models/user');
  var Item = require('../../models/item');

  var clientID = process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_ID || logger.crit('Client ID not provided by environment for foursquare config');
  var clientSecret = process.env.ASHEVILLE_SYNC_SOURCES_FOURSQUARE_CLIENT_SECRET || logger.crit('Client secret not provided by environment for foursquare config');
  var callbackURL = app.host + '/sources/foursquare/auth-callback';

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
    if (req.session.sourcesFoursquareAuthRedirectPath) {
      res.redirect(req.session.sourcesFoursquareAuthRedirectPath);
      req.session.sourcesFoursquareAuthRedirectPath = null;
    } else {
      res.redirect('/sources/foursquare');
    }
  });

  app.get('/sources/foursquare', app.authFilter, authFilter, function(req, res) {
    logger.trace('finding foursquare items');

    items = Item.find({
      user_id: req.user.id,
      source_id: 'foursquare'
    }, function(error, items) {
      logger.trace('found foursquare items');

      if (error) {
        logger.error('failed to get foursquare items', {
          error: error
        });

        res.json({
          error: 'failed to load foursquare items'
        });
      } else {
        res.json({
          foursquare: {
            total_items_available: items.length,
            total_items_synced: items.filter(function(item) { return (item.sync_verified_at); }).length,
            content_types: [{
              id: 'checkin',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'checkin'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'checkin' && item.sync_verified_at); }).length
            },
            {
              id: 'tip',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'tip'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'tip' && item.sync_verified_at); }).length
            },
            {
              id: 'friend',
              total_items_available: items.filter(function(item) { return (item.content_type_id == 'friend'); }).length,
              total_items_synced: items.filter(function(item) { return (item.content_type_id == 'friend' && item.sync_verified_at); }).length
            }]
          }
        });
      }
    });
  });

  app.get('/sources/foursquare/sync/:aspect', app.authFilter, authFilter, function(req, res) {
    try {
      var aspect = req.params.aspect;

      UserStorageAuth.findOne({
        user_id: req.user.id,
      }, function(error, userStorageAuth) {
        if (error) {
          return logger.error('failed to find user storage auth for session user', { error: error });
        }

        var storage = require('../../controllers/storages/' + userStorageAuth.storage_id);

        foursquare.syncItems(req.user, storage, aspect);
        res.json({ 
          msg: 'foursquare sync started',
          aspect: aspect
        });
      });
    } catch (error) {
      logger.error('failed to sync foursquare items', {
        aspect: aspect,
        error: error
      });

      res.json({ error: error.message });
    }
  });

  return foursquare;
}