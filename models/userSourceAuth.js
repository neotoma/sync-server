var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('userSourceAuth', {
  userId: String,
  sourceId: String,
  sourceToken: String,
  sourceUserId: String
});