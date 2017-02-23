var passport = require('passport');
var User = require('../models/user');

passport.serializeUser(function(user, done) {
  done(undefined, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, done);
});

module.exports = passport;