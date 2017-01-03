var ModelFactory = require('../factories/model');

module.exports = ModelFactory.new('job', {
  type: { type: String, required: true },
  sourceId: { type: String }
});