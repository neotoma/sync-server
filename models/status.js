var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('status', {
  userId: String,
  storageId: String,
  sourceId: String,
  contentTypeId: String,
  totalItemsAvailable: Number,
  totalItemsSynced: Number,
  totalItemsPending: Number,
  lastSyncedItemId: String
});