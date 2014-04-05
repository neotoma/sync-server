module.exports = function(app, passport) {
  return {
    dropbox: require('./dropbox')(app, passport)
  };
}