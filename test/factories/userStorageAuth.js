var ObjectFactory = require('./object');
var UserStorageAuth = require('../../models/userStorageAuth');

module.exports = new ObjectFactory(UserStorageAuth, {
  userId: 'userStorageAuthUserId',
  storageId: 'userStorageAuthStorageId',
  storageToken: 'userStorageAuthStorageToken',
  storageUserId: 'userStorageAuthStorageUserId'
});