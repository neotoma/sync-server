var statusController = require('../../controllers/status');

module.exports = function(app) {
  app.get('/statuses', function(req, res) {
    statusController.dataForUser(req.user, function(error, data) {
      if (error) {
        res.json({
          error: error
        });
      } else {
        res.json(data);
      }
    });
  });
}