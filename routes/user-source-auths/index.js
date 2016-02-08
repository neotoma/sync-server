var UserSourceAuth = require('../../models/user-source-auth');
var Status = require('../../models/status');
var Item = require('../../models/item');

module.exports = function(app) {
  app.get('/userSourceAuths', app.authFilter, function(req, res) {
    if (!req.user) {
      return res.json({
        user_source_auths: []
      });
    }

    UserSourceAuth.find({
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

  app.delete('/userSourceAuths/:id', app.authFilter, function(req, res) {
    var id = req.params.id;
    
    UserSourceAuth.findOne({
      _id: id
    }, function(error, userSourceAuth) {
      if (error) {
        logger.error('failed to find userSourceAuth object for deletion', { error: error });
      } else {
        if (userSourceAuth) {
          userSourceAuth.remove(function(error) {
            Item.remove({
              user_id: req.user.id,
              source_id: userSourceAuth.source_id
            }, function(error) {
              Status.remove({
                user_id: req.user.id,
                source_id: userSourceAuth.source_id
              }, function(error) {
                res.status(204).json();
              });
            });
          });
        }
      }
    });
  });
}