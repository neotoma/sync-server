require('park-ranger')();

var assert = require('assert'),
  assertFunctionCallbacksError = require('app/lib/assertions/functionCallbacksError'),
  assertFunctionCallbacksResult = require('app/lib/assertions/functionCallbacksResult'),
  async = require('async'),
  storagePath = require('app/controllers/item/storagePath'),
  wh = require('app/lib/warehouse');

describe('itemController storagePath method', function() {
  assertFunctionCallbacksError(storagePath, [{
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

  assertFunctionCallbacksResult(storagePath, [{
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
      assert.equal(result, `/${this.params[0].contentType.pluralLowercaseName()}/${this.params[0].source.lowercaseName()}-${this.params[1].id}.json`);
      done();
    }
  }]);
});
