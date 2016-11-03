module.exports = require('./warehouse')('status', {
  userId: 'statusUserId',
  storageId: 'statusStorageId',
  sourceId: 'statusSourceId',
  contentTypeId: 'statusContentTypeId',
  totalItemsAvailable: 12345,
  totalItemsSynced: 10000,
  totalItemsPending: 2345,
  lastSyncedItemId: 'statusLastSyncedItemId'
});