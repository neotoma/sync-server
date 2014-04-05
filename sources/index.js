module.exports = function(app, passport, storages) {
  return { 
    foursquare: require('./foursquare')(app, passport, storages)
  };
}