var ObjectFactory = require('./object');
var User = require('../../models/user');

module.exports = new ObjectFactory(User, {
  admin: false,
  email: 'tester@example.com',
  name: 'Tester McTesty'
});