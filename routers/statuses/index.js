var statusController = require('../../controllers/status');

module.exports = function(app) {
  app.get('/statuses', app.authFilter, function(req, res) {
    statusController.json(function(error, data) {
      if (error) {
        res.json({
          error: error
        });
      } else {
        res.json(data);
      }
    }, { userId: req.user.id });
  });
}