var _ = require('lodash');
var app = require('app');
var async = require('async');
var debug = require('app/lib/debug')('syncServer:auths');
var logger = require('app/lib/logger');
var ObjectId = require('mongoose').Types.ObjectId;
var passport = require('app/lib/passport');
var path = require('path');
var pluralize = require('pluralize');
var User = require('app/models/user');

var models = {
  source: require('app/models/source'),
  storage: require('app/models/storage'),
  userSourceAuth: require('app/models/userSourceAuth'),
  userStorageAuth: require('app/models/userStorageAuth')
};

var reqPassportDocument = function(req, res, next) {
  if (!req.params.type || !req.params.id) {
    return next();
  }

  var Model = models[pluralize.singular(req.params.type)];

  if (!Model) {
    return next();
  }

  var query = {
    clientId: { $ne: null },
    clientSecret: { $ne: null },
    itemStorageEnabled: true,
    passportStrategy: { $ne: null },
    slug: { $ne: null }
  };

  if (ObjectId.isValid(req.params.id)) {
    query._id = ObjectId(req.params.id);
  } else {
    query.slug = req.params.id;
  }

  Model.findOne(query, (error, document) => {
    if (!document) {
      return next();
    }

    req.document = document;

    var UserAuth;

    if (Model.modelName === 'Source') {
      UserAuth = models['userSourceAuth'];
    } else if (Model.modelName === 'Storage') {
      UserAuth = models['userStorageAuth'];
    } else {
      throw new Error('Model not supported');
    }

    var log = logger.scopedLog({
      modelName: Model.modelName,
      documentId: document.id
    });

    var passportStrategy = require(document.passportStrategy);

    req.strategy = new passportStrategy.Strategy({
      clientID: document.clientId,
      clientSecret: document.clientSecret,
      consumerKey: document.clientId,
      consumerSecret: document.clientSecret,
      callbackURL: app.host + path.resolve('/', Model.modelType(), document.slug, 'auth-callback'),
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
          if (!profile.emails || profile.emails.length < 1 || !profile.emails[0].value) {
            return done(new Error('Failed to find user email within profile data'));
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
        if (error) {
          log('error', 'Authentication router failed to authenticate user', {
            message: error.message
          });
        }

        done(error, user);
      });
    });

    passport.use(req.strategy);

    next();
  });
};

app.get('/:type/:id/auth', reqPassportDocument, function(req, res, next) {
  if (!req.document) {
    return res.sendStatus(404);
  }

  if (req.query.redirectURL) {
    req.session.authRedirectURL = req.query.redirectURL;
  } else {
    delete req.session.authRedirectURL;
  }

  passport.authenticate(req.strategy.name, { scope: req.document.authScope })(req, res, next);
});

app.get('/:type/:id/auth-callback', reqPassportDocument, function(req, res) {
  debug.start('auth-callback');
  
  var authenticate = function(done) {
    passport.authenticate(req.strategy.name, (error, user) => {
      done(error, user);
    })(req, res);
  };

  var logIn = function(user, done) {
    req.logIn(user, done);
  };

  async.waterfall([authenticate, logIn], (error) => {
    if (error) {
      debug.error('auth-callback error: %s', error.message);
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
});