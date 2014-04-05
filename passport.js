module.exports = function(User) {
  var passport = require('passport');

  passport.serializeUser(function(user, done) {
    User.findOrCreate(user, function(error, user) {
      if (error) {
        console.error(error);
      } else {
        done(null, user.id);
      }
    });
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  return passport;
}