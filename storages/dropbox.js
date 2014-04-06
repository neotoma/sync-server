module.exports = function(app, passport, User) {
  var dropboxPassport = require('passport-dropbox-oauth2');
  var https = require('https');
  var dropbox = {};

  dropbox.saveFile = function(user, path, content, callback, error) {
    var options = {
      host: 'api-content.dropbox.com',
      path: '/1/files_put/sandbox/' + path + '?access_token=' + user.storages.dropbox.token,
      method: 'PUT'
    };

    try {
      var req = https.request(options, function(res) {
        if (res.statusCode == 401) {
          throw { message: 'Unauthorized request' };
        }

        var data = '';

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          if (callback) {
            callback(JSON.parse(data));
          }
        });
      }).on('error', function(e) {
        error(e);
      });

      req.write(content);
      req.end();
    } catch (e) {
      error(e);
    }
  };

  dropbox.authFilter = function(req, res, next) {
    if (typeof req.user == 'undefined' || !req.user.storages.dropbox.id) {
      req.session.storagesDropboxAuthRedirectPath = req.path;

      if (req.path == '/storages/dropbox/auth') {
        req.session.storagesDropboxAuthRedirectPath = null;
      } else {
        req.session.storagesDropboxAuthRedirectPath = req.path;
      }
      
      res.redirect('/storages/dropbox/auth');
      return;
    }

    next();
  };

  passport.use(new dropboxPassport.Strategy({
      clientID: app.config.storages.dropbox.appKey,
      clientSecret: app.config.storages.dropbox.appSecret,
      callbackURL: app.config.storages.dropbox.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      app.model.user.findOrCreate({ 
        storages: {
          dropbox: {
            id: profile.id
          }
        }
      }, function(error, user) {
        user.storages.dropbox.token = accessToken;
        user.save(function() {
          return done(error, user);
        });
      });
    }
  ));

  app.get('/storages/dropbox/auth', passport.authenticate('dropbox-oauth2'));

  app.get('/storages/dropbox/auth-callback', passport.authenticate('dropbox-oauth2', { 
    failureRedirect: '/storages/dropbox/auth'
  }), function(req, res) {
    if (req.session.storagesDropboxAuthRedirectPath) {
      res.redirect(req.session.storagesDropboxAuthRedirectPath);
      req.session.storagesDropboxAuthRedirectPath = null;
    } else {
      res.redirect('/storages/dropbox');
    }
  });

  app.get('/storages/dropbox', dropbox.authFilter, function(req, res) {
    res.json({ 
      storages: { 
        dropbox: { 
          token: req.user.storages.dropbox.token 
        } 
      } 
    });
  });

  app.get('/storages/dropbox/account/info', dropbox.authFilter, function(req, res) {
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

  app.get('/storages/dropbox/file-put-test', dropbox.authFilter, function(req, res) {
    dropbox.saveFile(
      req.user, 
      'test.txt', 
      'hello world!', 
      function(response) {
        res.json(response);
      }, 
      function(e) {
        res.json({ error: e.message });
      }
    );

    return;

    var options = {
      host: 'api-content.dropbox.com',
      path: '/1/files_put/sandbox/test.txt?access_token=' + req.user.storages.dropbox.token,
      method: 'PUT'
    };

    body = 'hello world';

    _res = res;

    try {
      var req = https.request(options, function(res) {
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

      req.write(body);
      req.end();
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  return dropbox;
}