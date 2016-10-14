var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('user', {
  admin: { type: Boolean, default: false },
  email: { type: String, required: true },
  name: String
});