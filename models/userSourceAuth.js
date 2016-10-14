var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('userSourceAuth', {
  userId: { type: String, required: true },
  sourceId: { type: String, required: true },
  sourceToken: String,
  sourceUserId: String
});