var storedItemData = require('app/socketEvents/storedItemData');

module.exports = function(server, socket) {
  return storedItemData(server, socket);
};
