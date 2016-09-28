var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('userStorageAuth', {
  userId: String,
  storageId: String,
  storageToken: String,
  storageUserId: String
});