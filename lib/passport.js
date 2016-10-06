var User = require('../models/user');
var passport = require('passport');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(error, user) {
    done(error, user);
  });
});

module.exports = passport;