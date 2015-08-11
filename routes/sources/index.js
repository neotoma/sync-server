var logger = require('../../lib/logger');
var UserSourceAuth = require('../../models/user-source-auth');
var UserStorageAuth = require('../../models/user-storage-auth');

module.exports = function(app) {
  require('./router')(app, foursquare);
  require('./router')(app, instagram);

  app.get('/sources', app.authFilter, function(req, res) {
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

      var sources = require('../../objects/sources');

      json.sources = sources.map(function(source) {
        return source.toObject(json.userSourceAuths);
      });

      json.contentTypes = require('../../controllers/content_types').toObject(json.sources);

      res.json(json);
    });
  });
}