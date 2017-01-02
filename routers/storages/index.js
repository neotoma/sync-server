module.exports = function(app) {
  var storages = {
    dropbox: require('./dropbox')(app)
  };

  return storages;
}