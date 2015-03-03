var NotificationRequest = require('../models/notification-request');

module.exports = function(app) {
  app.get('/notificationRequests', app.authFilter, function(req, res) {
    NotificationRequest.find({
      user_id: req.user.id
    }, function(error, notificationRequests) {
      if (error) {
        res.json({
          error: error
        });
      } else {
        res.json({
          'notificationRequests': notificationRequests.map(function(notificationRequest) {
            return notificationRequest.toObject();
          })
        });
      }
    });
  });

  app.post('/notificationRequests', app.authFilter, function(req, res) {
    NotificationRequest.create({
      user_id: req.user.id,
      source_id: req.body.notificationRequest.source,
      event: req.body.notificationRequest.event
    }, function(error, notificationRequest) {
      res.json({
        'notificationRequest': notificationRequest.toObject()
      });
    });
  });

  app.delete('/notificationRequests/:id', app.authFilter, function(req, res) {
    var id = req.params.id;
    
    NotificationRequest.findOne({
      _id: id
    }, function(error, notificationRequest) {
      if (error) {
        logger.error('failed to find notificationRequest object for deletion', { error: error });
      } else {
        if (notificationRequest) {
          notificationRequest.remove();
        }
      }

      res.status(204).json();
    });

    return;
  });
}