var logger = require('./logger');

module.exports = function(app) {
  var passport = require('passport');

  passport.serializeUser(function(user, done) {
    done(null, user.id);
    logger.trace('passport user serialized', { user_id: user.id });
  });

  passport.deserializeUser(function(id, done) {
    app.model.user.findById(id, function(err, user) {
      done(err, user);
      logger.trace('passport user deserialized', { user_id: user.id });
    });
  });

  return passport;
}