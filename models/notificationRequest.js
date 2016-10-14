var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('notificationRequest', {
  userId: { type: String, required: true },
  event: { type: String, required: true },
  sourceId: String,
  storageId: String
});