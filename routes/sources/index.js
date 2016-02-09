var logger = require('../../lib/logger');
var UserSourceAuth = require('../../models/user_source_auth');
var UserStorageAuth = require('../../models/user_storage_auth');
var foursquare = require('../../objects/sources/foursquare');
var instagram = require('../../objects/sources/instagram');
var twitter = require('../../objects/sources/twitter');

module.exports = function(app) {
  require('./router')(app, foursquare);
  require('./router')(app, instagram);
  require('./router')(app, twitter);

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