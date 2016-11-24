module.exports = require('./warehouse')('item', {
  userId: 'itemUserId',
  storageId: 'storageplex',
  sourceId: 'itemSourceId',
  sourceItemId: 'itemSourceItemId',
  contentTypeId: 'widget',
  storageAttemptedAt: new Date(2015, 1, 1, 1, 1, 1, 1),
  storageVerifiedAt: new Date(2015, 1, 1, 1, 2, 1, 1),
  storageFailedAt: new Date(2015, 1, 1, 1, 3, 1, 1),
  storageBytes: 12345,
  storageError: 'Item storage error',
  data: {
    foo: 'bar'
  }
});