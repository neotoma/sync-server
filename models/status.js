var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('status', {
  userId: { type: String, required: true },
  storageId: { type: String, required: true },
  sourceId: { type: String, required: true },
  contentTypeId: { type: String, required: true },
  totalItemsAvailable: Number,
  totalItemsStored: Number,
  totalItemsPending: Number,
  lastSyncedItemId: String
});