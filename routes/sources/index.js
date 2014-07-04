module.exports = function(app) {
  var sources = {
    foursquare: require('./foursquare')(app)
  };

  return sources;
}