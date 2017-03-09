require('dotenvs')('test');
var assert = require('assert');
var assertions = require('app/lib/assertions');
var async = require('async');
var controller = require('app/controllers/item');
var wh = require('app/lib/warehouse');

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
      var saveContentType = (done) => {
        wh.oneSaved('contentType', {
          _id: this.params[0].contentType
        }, done);
      };

      var saveSource = (done) => {
        wh.oneSaved('source', {
          _id: this.params[0].source
        }, done);
      };

      var populateItem = (done) => {
        this.params[0].populate('contentType source', done);
      };

      async.series([
        saveContentType,
        saveSource,
        populateItem
      ], (error) => {
        done(error);
      });
    },
    result: function(result, done) {
      assert.equal(result, `/${this.params[0].source.pluralKebabName()}/${this.params[0].contentType.pluralKebabName()}/${this.params[0].id}.json`);
      done();
    }
  }]);
});