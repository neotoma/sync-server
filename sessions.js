var logger = require('./logger');

module.exports = function(app) {
  app.get('/sessions', function(req, res) {
    logger.trace('session', req.session);

    app.model.user.findById(req.session.passport.user, function(error, user) {
      var users = [];

      if (user) {
        users[0] = user;
      }

      res.json({ 
        sessions: [{
          id: req.session.id,
          users: users
        }] 
      });
    });
  });
}