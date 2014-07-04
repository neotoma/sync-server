var logger = require('../lib/logger');
var User = require('../models/user');

module.exports = function(app) {
  app.get('/sessions', function(req, res) {
    logger.trace('session', req.session);

    var respond = function(userJSON) {
      var users = [];

      if (userJSON) {
        users.push(userJSON);
      }

      res.json({
        sessions: [{
          id: req.session.id,
          users: users
        }] 
      });
    };

    var user_id = req.session.passport.user;

    if (user_id) {
      User.findById(req.session.passport.user, function(error, user) {
        if (user) {
          logger.trace('found user by ID');
          respond(user.toObject({ getters: true }));
        } else {
          logger.warn('failed to find user by ID');
          respond();
        }
      });
    } else {
      logger.trace('no user ID stored in session');
      respond();
    }
  });

  app.del('/sessions/:id', function(req, res) {
    if (req.params.id == req.session.id) {
      req.logout();
    }

    res.json(null);
  });
}