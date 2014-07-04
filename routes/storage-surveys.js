module.exports = function(app) {
  app.get('/storageSurveys', function(req, res) {
    res.json({ storageSurveys: [] });
  });
}