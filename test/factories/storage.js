var ObjectFactory = require('./object');
var Storage = require('../../models/storage');

module.exports = new ObjectFactory(Storage, {
  id: 'storageId',
  host: 'storageHost'
});