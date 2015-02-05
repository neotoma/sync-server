module.exports = function(app) {
  require('./sessions')(app);
  require('./storages')(app);
  require('./sources')(app);
  require('./user-storage-auths')(app);
  require('./user-source-auths')(app);
  require('./statuses')(app);
}