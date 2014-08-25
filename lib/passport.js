var logger = require('./logger');
var User = require('../models/user');

var passport = require('passport');

passport.serializeUser(function(user, done) {
  done(null, user.id);
  logger.trace('serialized passport user', { id: user.id });
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(error, user) {
    done(error, user);

    if (user) {
      logger.trace('deserialized passport user', { id: user.id });
    } else {
      logger.error('unable to deserialize passport user', { id: id });
    }
  });
});

module.exports = passport;