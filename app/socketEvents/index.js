module.exports = function(server, socket) {
  return require('app/socketEvents/storedItemData')(server, socket);
};