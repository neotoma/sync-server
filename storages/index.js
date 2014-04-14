module.exports = function(app, passport) {
  var storages = {
    dropbox: require('./dropbox')(app, passport)
  };

  return storages;
}