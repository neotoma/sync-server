var logger = require('./logger');

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

    app.model.user.findById(req.session.passport.user, function(error, user) {
      if (user) {
        logger.trace('found user by id');
        respond(user.toObject({ getters: true }));
      } else {
        logger.warn('failed to find user by id');
        respond();
      }
    });
  });

  app.del('/sessions/:id', function(req, res) {
    if (req.params.id == req.session.id) {
      req.logout();
    }

    res.json(null);
  });
}