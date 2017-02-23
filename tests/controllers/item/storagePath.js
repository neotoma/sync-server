require('../../../lib/env')('test');
var assert = require('assert');
var assertions = require('../../../assertions');
var async = require('async');
var controller = require('../../../controllers/item');
var wh = require('../../../lib/warehouse');

describe('itemController.storagePath method', function() {
  assertions.function.callbacks.error(controller.storagePath, [{
    when: 'no item parameter provided',
    params: [undefined, wh.jsonData()],
    error: 'Parameter item undefined or null'
  }, {
    when: 'item has no id',
    params: [{ contentType: {} }, wh.jsonData()],
    error: 'Parameter item has no id property'
  }, {
    when: 'item has no contentType',
    params: [{ id: 'bar' }, wh.jsonData()],
    error: 'Parameter item has no contentType property'
  }]);

  assertions.function.callbacks.result(controller.storagePath, [{
    when: 'item provided',
    params: [wh.one('item'), wh.jsonData()],
    before: function(done) {
      var contentType = wh.one('contentType', {
        _id: this.params[0].contentType
      });

      var source = wh.one('source', {
        _id: this.params[0].source
      });

      var populateItem = (done) => {
        this.params[0].populate('contentType source', done);
      };

      async.series([
        contentType.save,
        source.save,
        populateItem
      ], done);
    },
    result: function(result, done) {
      assert.equal(result, `/${this.params[0].source.pluralKebabName()}/${this.params[0].contentType.pluralKebabName()}/${this.params[0].id}.json`);
      done();
    }
  }]);
});