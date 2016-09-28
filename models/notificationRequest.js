var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('notificationRequest', {
  userId: String,
  sourceId: String,
  storageId: String,
  event: String
});