module.exports = function(app) {
  var passport = require('passport');

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    app.model.user.findById(id, function(err, user) {
      done(err, user);
    });
  });

  return passport;
}