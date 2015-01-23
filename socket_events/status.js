var Item = require('../models/item');
var statusController = require('../controllers/status.js');

module.exports = function(app, socket) {
  app.on('itemSyncVerified', function(item) {
    if (socket.request.user.logged_in && item.user_id == socket.request.user.id) {
      statusController.dataForUser(socket.request.user, function(error, data) {
        if (!error) {
          app.io.emit('statusesUpdate', data);
        }
      });
    }
  });
}