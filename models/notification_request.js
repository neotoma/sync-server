var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose')();

var notificationRequestSchema = mongoose.Schema({
  userId: String,
  sourceId: String,
  storageId: String,
  event: String
});

notificationRequestSchema.set('toObject', { getters: true });
notificationRequestSchema.options.toObject.transform = mongoose.transform;

module.exports = mongoose.model('NotificationRequest', notificationRequestSchema);