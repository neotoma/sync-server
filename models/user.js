var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('user', {
  name: String,
  email: String,
  admin: Boolean
});