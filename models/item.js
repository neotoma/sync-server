var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('item', {
  userId: String,
  storageId: String,
  sourceId: String,
  sourceItemId: String,
  contentTypeId: String,
  syncAttemptedAt: Date,
  syncVerifiedAt: Date,
  syncFailedAt: Date,
  bytes: Number,
  path: String,
  description: String,
  error: String,
  data: Object
});