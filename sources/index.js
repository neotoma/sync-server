module.exports = function(app, passport, storages) {
  var sources = {
    foursquare: require('./foursquare')(app, passport, storages)
  };

  app.get('/sources', function(req, res) {
    var json = { sources: [] };

    for(var id in sources) {
      json.sources.push(sources[id].toJSON(req.user));
    }

    res.json(json);
  });

  return sources;
}