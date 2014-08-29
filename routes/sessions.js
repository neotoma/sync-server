var logger = require('../lib/logger');
var User = require('../models/user');
var UserStorageAuth = require('../models/user-storage-auth');

module.exports = function(app) {
  app.get('/sessions', function(req, res) {
    logger.trace('session', req.session);

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

    var user_id = req.session.passport.user;

    if (user_id) {
      User.findById(req.session.passport.user, function(error, user) {
        if (user) {
          logger.trace('found user by ID');

          UserStorageAuth.findOne({
            user_id: user.id
          }, function(error, userStorageAuth) {
            respond(user, userStorageAuth);
          });
        } else {
          logger.error('failed to find user by ID');
          respond();
        }
      });
    } else {
      logger.trace('no user ID stored in session');
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