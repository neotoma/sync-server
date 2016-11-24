var assert = require('assert');
var db = require('../../db');
var wh = require('../../warehouse');
var itThrowsError = require('../../method/itThrowsError');
var itReturnsResult = require('../../method/itReturnsResult');
var controller = require('../../../controllers/item');
var method = controller.storagePath;

describe('itemController.storagePath method', function() {
  itThrowsError(method, [{
    when: 'no item parameter provided',
    params: [undefined],
    error: 'Parameter item undefined or null'
  }, {
    when: 'item has no id',
    params: [{ foo: 'bar' }],
    error: 'Parameter item has no id property'
  }, {
    when: 'item has no contentTypeId',
    params: [{ id: 'bar' }],
    error: 'Parameter item has no contentTypeId property'
  }]);

  itReturnsResult(method, [{
    when: 'item provided',
    params: [wh.item],
    expectedResult: function(test, done) {
      assert.deepEqual(test.result, '/widgets/' + test.params[0].id + '.json');
      done();
    }
  }]);
});