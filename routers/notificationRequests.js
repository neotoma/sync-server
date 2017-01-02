var NotificationRequest = require('../models/notificationRequest');

module.exports = function(app) {
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