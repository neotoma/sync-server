module.exports = function(app, passport) {
  var dropboxPassport = require('passport-dropbox-oauth2');

  passport.use(new dropboxPassport.Strategy({
      clientID: process.env.ASHEVILLE_SYNC_DROPBOX_APP_KEY,
      clientSecret: process.env.ASHEVILLE_SYNC_DROPBOX_APP_SECRET,
      callbackURL: 'http://localhost:9090/storages/dropbox/auth-callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, { storages: { dropbox: { token: accessToken } } });
    }
  ));

  app.get('/storages/dropbox/auth', passport.authenticate('dropbox-oauth2'));

  app.get('/storages/dropbox/auth-callback', passport.authenticate('dropbox-oauth2', { 
    failureRedirect: '/login'
  }), function(req, res) {
    res.redirect('/storages/dropbox');
  });

  app.get('/storages/dropbox', function(req, res) {
    res.json({ storages: { dropbox: { token: req.user.storages.dropbox.token } } });
  });
}