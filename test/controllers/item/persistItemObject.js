var assert = require('assert');
var db = require('../../db');
var wh = require('../../warehouse');
var nock = require('../../nock');
var itCallbacksError = require('../../method/itCallbacksError');
var itCallbacksResult = require('../../method/itCallbacksResult');
var method = require('../../../controllers/item').persistItemObject;
var attributes = wh.swh.item.attributes;

describe('itemController.persistItemObject method', function() {
  beforeEach(db.clear);

  itCallbacksError(method, [{
    when: 'no object parameter provided',
    params: [undefined],
    error: 'Parameter object undefined or null',
  }, {
    when: 'object has no userId property',
    params: [attributes],
    error: 'Parameter object has no userId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.userId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'object has no storageId property',
    params: [attributes],
    error: 'Parameter object has no storageId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.storageId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'object has no sourceId property',
    params: [attributes],
    error: 'Parameter object has no sourceId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.sourceId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'object has no contentTypeId property',
    params: [attributes],
    error: 'Parameter object has no contentTypeId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.contentTypeId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'object has no sourceItemId property',
    params: [attributes],
    error: 'Parameter object has no sourceItemId property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.sourceItemId;
      test.params[0] = attributes;
      done();
    }
  }, {
    when: 'object has no data property',
    params: [attributes],
    error: 'Parameter object has no data property',
    before: function(test, done) {
      var attributes = Object.clone(wh.swh.item.attributes);
      delete attributes.data;
      test.params[0] = attributes;
      done();
    }
  }]);

  itCallbacksResult(method, [{
    when: 'with matching data when called with proper object',
    params: [attributes],
    expectedResult: function(test, done) {
      assert.deepEqual(test.result.data, attributes.data);
      done();
    }
  }]);
});