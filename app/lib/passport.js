var passport = require('passport'),
  User = require('app/models/user');

passport.serializeUser(function(user, done) {
  done(undefined, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done);
});

module.exports = passport;
