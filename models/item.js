var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('item', {
  userId: { type: String, required: true },
  storageId: { type: String, required: true },
  sourceId: { type: String, required: true },
  sourceItemId: { type: String, required: true },
  contentTypeId: { type: String, required: true },
  syncAttemptedAt: Date,
  syncVerifiedAt: Date,
  syncFailedAt: Date,
  bytes: Number,
  path: String,
  description: String,
  error: String,
  data: Object
});