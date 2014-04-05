module.exports = function(mongoose) {
  var passport = require('passport');
  passport.User = require('./models/user')(mongoose);

  passport.serializeUser(function(user, done) {
    passport.User.findOrCreate(user, function(error, user) {
      if (error) {
        console.error(error);
      } else {
        done(null, user.id);
      }
    });
  });

  passport.deserializeUser(function(id, done) {
    passport.User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  return passport;
}