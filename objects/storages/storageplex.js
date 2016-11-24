var Storage = require('../../models/storage');
var wh = require('../../test/warehouse/storage');

module.exports = new Storage(wh.attributes);