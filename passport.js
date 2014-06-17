var logger = require('./logger');

module.exports = function(app) {
  var passport = require('passport');

  passport.serializeUser(function(user, done) {
    done(null, user.id);
    logger.trace('serialized passport user', { id: user.id });
  });

  passport.deserializeUser(function(id, done) {
    app.model.user.findById(id, function(error, user) {
      done(error, user);

      if (user) {
        logger.trace('deserialized passport user', { id: user.id });
      } else {
        logger.warn('unable to deserialize passport user', { id: id });
      }
    });
  });

  return passport;
}