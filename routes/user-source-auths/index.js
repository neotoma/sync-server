var UserSourceAuths = require('../../models/user-source-auth');

module.exports = function(app) {
  app.get('/userSourceAuths', function(req, res) {
    if (!req.user) {
      return res.json({
        user_source_auths: []
      });
    }

    UserSourceAuths.find({
      user_id: req.user.id
    }, function(error, userSourceAuths) {
      if (error) {
        return res.json({
          error: error
        });
      }

      var json = { 
        user_source_auths: userSourceAuths.map(function(userSourceAuth) {
          return userSourceAuth.toObject();
        }) 
      };

      res.json(json);
    });
  });

  app.delete('/userSourceAuths/:id', function(req, res) {
    var id = req.params.id;
    console.log('id', id);
    
    UserSourceAuths.findOne({
      _id: id
    }, function(error, userSourceAuth) {
      if (error) {
        logger.error('failed to find userSourceAuth object for deletion', { error: error });
      } else {
        if (userSourceAuth) {
          userSourceAuth.remove();
        }
      }

      res.status(204).json();
    });
  });
}