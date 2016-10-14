var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('userStorageAuth', {
  userId: { type: String, required: true },
  storageId: { type: String, required: true },
  storageToken: String,
  storageUserId: String
});