var logger = require('../lib/logger');
var User = require('../models/user');
var UserStorageAuth = require('../models/user-storage-auth');

module.exports = function(app) {
  app.get('/sessions', function(req, res) {
    var respond = function(user, userStorageAuth) {
      var users = [];
      var userStorageAuths = [];

      if (user) {
        var userJSON = user.toObject();

        if (userStorageAuth) {
          userJSON.userStorageAuths = [userStorageAuth.id];
          userStorageAuths.push(userStorageAuth.toObject());
        }

        users.push(userJSON);
      }

      res.json({
        sessions: [{
          id: req.session.id,
          users: users.map(function(user) {
            return user.id;
          })
        }],
        users: users,
        userStorageAuths: userStorageAuths
      });
    };

    if (req.user) {
      logger.trace('found user by ID');

      UserStorageAuth.findOne({
        user_id: req.user.id
      }, function(error, userStorageAuth) {
        respond(req.user, userStorageAuth);
      });
    } else {
      logger.trace('no user stored in session');
      respond();
    }
  });

  app.delete('/sessions/:id', function(req, res) {
    if (req.params.id == req.session.id) {
      req.logout();
    }

    res.status(204).json(null);
  });
}