var NotificationRequest = require('../models/notification_request');

module.exports = function(app) {
  app.get('/notificationRequests', app.authFilter, function(req, res) {
    NotificationRequest.find({
      userId: req.user.id
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
    new NotificationRequest({
      userId: req.user.id,
      sourceId: req.body.notificationRequest.source,
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