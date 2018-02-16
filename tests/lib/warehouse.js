require('park-ranger')();

var assert = require('assert'),
  assertFunctionReturnsResult = require('app/lib/assertions/functionReturnsResult'),
  assertFunctionThrowsError = require('app/lib/assertions/functionThrowsError'),
  assertFunctionThrowsNoError = require('app/lib/assertions/functionThrowsNoError'),
  assertObjectHasProperties = require('app/lib/assertions/objectHasProperties'),
  wh = require('app/lib/warehouse');

describe('warehouse', () => {
  assertObjectHasProperties('warehouse', wh, 'itemDataObjects' [
    'bytes',
    'jpegData',
    'jpegPath',
    'jpegUrl',
    'jsonData',
    'jsonPath',
    'jsonUrl',
    'pagination'
  ]);

  assertFunctionThrowsNoError('itemDataObjects', wh.itemDataObjects, [{
    context: wh,
    when: 'no contentType provided',
    params: []
  }]);

  assertFunctionReturnsResult('itemDataObjects', wh.itemDataObjects, [{
    context: wh,
    when: 'contentType and no count provided',
    params: [wh.one('contentType')],
    result: function(itemDataObjects, done) {
      assert.equal(itemDataObjects.length, 234);
      assert(itemDataObjects[0].id);
      assert(itemDataObjects[0].type);
      assert(itemDataObjects[0].foo1);
      assert(itemDataObjects[0].foo2);
      assert(!itemDataObjects[0].foo3);
      done();
    }
  }, {
    context: wh,
    when: 'contentType and count provided',
    params: [wh.one('contentType'), 2],
    result: function(itemDataObjects, done) {
      assert.equal(itemDataObjects.length, 2);
      assert(itemDataObjects[1].id);
      assert(itemDataObjects[1].type);
      assert(itemDataObjects[1].foo1);
      assert(itemDataObjects[1].foo2);
      assert(!itemDataObjects[1].foo3);
      done();
    }
  }]);

  assertFunctionThrowsError('itemPages', wh.itemPages, [{
    when: 'no contentType provided',
    params: [wh.one('source'), undefined, wh.one('userSourceAuth')],
    error: 'Parameter contentType undefined or null'
  }, {
    when: 'no source provided',
    params: [undefined, wh.one('contentType'), wh.one('userSourceAuth')],
    error: 'Parameter source undefined or null'
  }, {
    context: wh,
    when: 'no userSourceAuth provided',
    params: [wh.one('source'), wh.one('contentType')],
    error: 'Parameter userSourceAuth undefined or null'
  }]);

  assertFunctionReturnsResult('itemPages', wh.itemPages, [{
    context: wh,
    when: 'contentType, source and userSourceAuth provided',
    params: [wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth')],
    result: function(itemPages, done) {
      assert.equal(itemPages.length, 4);
      assert(itemPages[1].things);
      done();
    }
  }]);
});
