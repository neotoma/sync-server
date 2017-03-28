var status = require('app/socketEvents/status');

module.exports = function(server, socket) {
  return status(server, socket);
};