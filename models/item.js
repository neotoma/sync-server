var ModelFactory = require('../factories/model');
var pluralize = require('pluralize');

module.exports = ModelFactory.new('item', {
  userId: { type: String, required: true },
  storageId: { type: String, required: true },
  sourceId: { type: String, required: true },
  sourceItemId: { type: String, required: true },
  contentTypeId: { type: String, required: true },
  storageAttemptedAt: Date,
  storageVerifiedAt: Date,
  storageFailedAt: Date,
  storageBytes: Number,
  storagePath: String,
  storageError: String,
  data: Object
});