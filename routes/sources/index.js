var logger = require('../../lib/logger');
var UserSourceAuth = require('../../models/user-source-auth');
var UserStorageAuth = require('../../models/user-storage-auth');

module.exports = function(app) {
  require('./foursquare')(app);

  app.get('/sources', function(req, res) {
    var json = { sources: [] };

    UserSourceAuth.find({
      user_id: req.user.id
    }, function(error, userSourceAuths) {
      if (error) {
        logger.error('failed to find user source auths for session user');
      } else {
        json.userSourceAuths = userSourceAuths.map(function(userSourceAuth) {
          return userSourceAuth.toObject();
        });
      }

      var sources = require('../../controllers/sources');

      json.sources = sources.map(function(source) {
        return source.toObject(json.userSourceAuths);
      });

      json.contentTypes = require('../../controllers/content_types').toObject(json.sources);

      res.json(json);
    });
  });

  app.post('/sources/sync', function(req, res) {
    var json = { sources: [] };

    UserStorageAuth.find({
      user_id: req.user.id
    }, function(error, userStorageAuths) {
      if (error || !userStorageAuths.length) {
        logger.error('failed to find user storage auths for session user');
      }

      var sources = require('../../controllers/sources');

      json.sources = sources.map(function(source) {
        return source.sync(req.user, require('../../controllers/storages/' + userStorageAuths[0].storage_id));
      });

      res.json(json);
    });
  });
}