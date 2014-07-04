module.exports = function(app) {
  require('./sessions')(app);
  require('./storage-surveys')(app);
  require('./storages')(app);
  require('./sources')(app);
}