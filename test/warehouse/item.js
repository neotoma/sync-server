module.exports = require('./warehouse')('item', {
  userId: 'itemUserId',
  storageId: 'itemStorageId',
  sourceId: 'itemSourceId',
  sourceItemId: 'itemSourceItemId',
  contentTypeId: 'widget',
  storageAttemptedAt: new Date(2015, 1, 1, 1, 1, 1, 1),
  storageVerifiedAt: new Date(2015, 1, 1, 1, 2, 1, 1),
  storageFailedAt: new Date(2015, 1, 1, 1, 3, 1, 1),
  bytes: 12345,
  path: '/path/to/item',
  description: 'Item description',
  error: 'Item error',
  data: {
    foo: 'bar'
  }
});