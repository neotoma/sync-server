var logger = require('./logger');

module.exports = function(app) {
  app.get('/sessions', function(req, res) {
    logger.trace('session', req.session);

    var respond = function(userJSON) {
      res.json({
        sessions: [{
          id: req.session.id,
          users: [userJSON]
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
}