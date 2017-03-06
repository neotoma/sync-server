var _ = require('lodash');
var async = require('async');
var debug = require('app/lib/debug')('syncServer:auth');
var logger = require('app/lib/logger');
var passport = require('app/lib/passport');
var path = require('path');
var User = require('app/models/user');
var UserSourceAuth = require('app/models/userSourceAuth');
var UserStorageAuth = require('app/models/userStorageAuth');
var validateParams = require('app/lib/validateParams');

module.exports = function(app, Model, document) {
  validateParams([{
    name: 'app', variable: app, required: true, requiredProperties: ['host'],
  }, {
    name: 'Model', variable: Model, required: true, requiredProperties: ['modelName', 'modelType']
  }, {
    name: 'document', variable: document, required: true, requiredProperties: ['id', 'passportStrategy', 'clientId', 'clientSecret']
  }]);

  if (Model.modelName === 'Source') {
    var UserAuth = UserSourceAuth;
  } else if (Model.modelName === 'Storage') {
    var UserAuth = UserStorageAuth;
  } else {
    throw new Error('Model not supported');
  }

  var log = logger.scopedLog({
    modelName: Model.modelName,
    documentId: document.id
  });

  var passportStrategy = require(document.passportStrategy);

  var strategy = new passportStrategy.Strategy({
    clientID: document.clientId,
    clientSecret: document.clientSecret,
    consumerKey: document.clientId,
    consumerSecret: document.clientSecret,
    callbackURL: app.host + path.resolve('/', Model.modelType(), document.id, 'auth-callback'),
    passReqToCallback: true
  }, function(req, accessToken, refreshToken, profile, done) {
    var findOrCreateUserAuth = (done) => {
      var conditions = {};
      conditions[_.lowerFirst(Model.modelName)] = document.id;
      conditions[_.lowerFirst(Model.modelName) + 'User'] = profile.id;

      if (req.user) {
        conditions.user = req.user.id;
      }

      UserAuth.findOrCreate(conditions, done);
    };

    var updateUserAuthToken = (userAuth, done) => {
      userAuth[_.lowerFirst(Model.modelName) + 'Token'] = accessToken;
      userAuth.save((error) => {
        done(error, userAuth);
      });
    };

    var findOrCreateUser = (userAuth, done) => {
      if (req.user) {
        done(undefined, userAuth, req.user);
      } else if (userAuth.user) {
        User.findOne({ _id: userAuth.user.id }, (error, user) => {
          done(error, userAuth, user);
        });
      } else {
        if (!profile.displayName) {
          var message = 'Failed to find user name within profile data';
          log('error', 'Auth router ' + _.lowerFirst(message));
          return done(new Error(message));
        }

        if (!profile.emails || profile.emails.length < 1 || !profile.emails[0].value) {
          var message = 'Failed to find user email within profile data';
          log('error', 'Auth router ' + _.lowerFirst(message));
          return done(new Error(message));
        }

        User.findOrCreate({
          name: profile.displayName,
          email: profile.emails[0].value
        }, (error, user) => {
          done(error, userAuth, user);
        });
      }
    };

    var updateUserAuthUser = (userAuth, user, done) => {
      if (userAuth.user === user.id) {
        return done(undefined, user);
      }

      userAuth.user = user.id;

      userAuth.save((error) => {
        done(error, user);
      });
    };

    async.waterfall([
      findOrCreateUserAuth, 
      updateUserAuthToken,
      findOrCreateUser,
      updateUserAuthUser
    ], (error, user) => {
      done(error, user);
    });
  });

  passport.use(strategy);

  app.get(path.resolve('/', Model.modelType(), document.id, 'auth'), function(req, res, next) {
    if (req.query.redirectURL) {
      req.session.authRedirectURL = req.query.redirectURL;
    } else {
      delete req.session.authRedirectURL;
    }

    passport.authenticate(strategy.name, { scope: document.authScope })(req, res, next);
  });

  app.get(path.resolve('/', Model.modelType(), document.id, 'auth-callback'), function(req, res) {
    debug.start('auth-callback');
    passport.authenticate(strategy.name, function(error, user, info) {
      debug('authenticate-callback error: %s', error ? error.message : 'n/a');

      if (error) {
        log('error', 'Auth router failed to authenticate user on callback with Passport', { error: error.message });
        return res.sendStatus(500);
      }

      req.logIn(user, function(error) {
        if (error) { 
          log('error', 'Auth router failed to create session after authentication', { error: error.message });
          return res.sendStatus(500);
        }

        if (req.session.authRedirectURL) {
          var authRedirectURL = req.session.authRedirectURL;
          delete req.session.authRedirectURL;

          res.redirect(authRedirectURL);
        } else {
          res.redirect('/sessions');
        }
      });
    })(req, res);
  });
};