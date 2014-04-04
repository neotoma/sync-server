module.exports = function(app, passport) {
  var dropboxPassport = require('passport-dropbox-oauth2');
  var https = require('https');

  passport.use(new dropboxPassport.Strategy({
      clientID: process.env.ASHEVILLE_SYNC_DROPBOX_APP_KEY,
      clientSecret: process.env.ASHEVILLE_SYNC_DROPBOX_APP_SECRET,
      callbackURL: 'http://localhost:9090/storages/dropbox/auth-callback'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, { 
        storages: { 
          dropbox: { 
            token: accessToken 
          } 
        } 
      });
    }
  ));

  app.get('/storages/dropbox/auth', passport.authenticate('dropbox-oauth2'));

  app.get('/storages/dropbox/auth-callback', passport.authenticate('dropbox-oauth2', { 
    failureRedirect: '/login'
  }), function(req, res) {
    if (req.session.dropboxAuthRedirect) {
      res.redirect(req.session.dropboxAuthRedirect);
      req.session.dropboxAuthRedirect = null;
    } else {
      res.redirect('/storages/dropbox');
    }
  });

  app.get('/storages/dropbox', function(req, res) {
    if (typeof req.user == 'undefined' || !req.user.storages.dropbox.token) {
      req.session.dropboxAuthRedirect = '/storages/dropbox';
      res.redirect('/storages/dropbox/auth');
      return;
    }

    res.json({ 
      storages: { 
        dropbox: { 
          token: req.user.storages.dropbox.token 
        } 
      } 
    });
  });

  app.get('/storages/dropbox/account/info', function(req, res) {
    if (typeof req.user == 'undefined' || !req.user.storages.dropbox.token) {
      req.session.dropboxAuthRedirect = '/storages/dropbox/account/info';
      res.redirect('/storages/dropbox/auth');
      return;
    }

    var options = {
      host: 'api.dropbox.com',
      path: '/1/account/info?access_token=' + req.user.storages.dropbox.token
    };

    _res = res;

    try {
      https.get(options, function(res) {
        if (res.statusCode == 401) {
          throw { message: 'Unauthorized request' };
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          _res.json({ response: JSON.parse(data) });
        });
      }).on('error', function(e) {
        res.json({ error: e.message });
      });
    } catch (e) {
      res.json({ error: e.message });
    }
  });
}