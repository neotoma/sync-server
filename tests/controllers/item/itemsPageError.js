require('park-ranger')();

var assert = require('assert'),
  assertFunctionReturnsResult = require('app/lib/assertions/functionReturnsResult'),
  assertFunctionThrowsError = require('app/lib/assertions/functionThrowsError'),
  itemsPageError = require('app/controllers/item/itemsPageError'),
  wh = require('app/lib/warehouse');

describe('itemController itemsPageError method', () => {
  assertFunctionReturnsResult('controller itemsPageError', itemsPageError, [{
    when: 'provided page with no meta',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType')), wh.one('source')],
    result: undefined
  }, {
    when: 'provided page with meta but no code',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {}
    }), wh.one('source')],
    result: undefined
  }, {
    when: 'provided page with meta and code below 400',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 399
      }
    }), wh.one('source')],
    result: undefined
  }, {
    when: 'provided page with meta and code below 300',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 299
      }
    }), wh.one('source')],
    result: undefined
  }, {
    when: 'provided page with meta and code above 1000',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 1001
      }
    }), wh.one('source')],
    result: function(error, done) {
      assert.equal(error.message, 'HTTP status code 1001');
      done();
    }
  }, {
    when: 'provided page with meta containing client error code',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 450
      }
    }), wh.one('source')],
    result: function(error, done) {
      assert.equal(error.message, 'HTTP status code 450');
      done();
    }
  }, {
    when: 'provided page with meta containing server error code',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 550
      }
    }), wh.one('source')],
    result: function(error, done) {
      assert.equal(error.message, 'HTTP status code 550');
      done();
    }
  }, {
    when: 'provided page with meta containing code and errorDetail',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 599,
        errorDetail: 'Whelp that wasn\'t good'
      }
    }), wh.one('source')],
    result: function(error, done) {
      assert.equal(error.message, 'Whelp that wasn\'t good (599)');
      done();
    }
  }, {
    when: 'provided page with meta containing code and errorType',
    params: [wh.itemPage(wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), {
      meta: {
        code: 499,
        errorType: 'something_bad'
      }
    }), wh.one('source')],
    result: function(error, done) {
      assert.equal(error.message, 'HTTP status code 499, something_bad');
      done();
    }
  }]);

  assertFunctionThrowsError('controller itemsPageError', itemsPageError, [{
    when: 'no page parameter provided',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    error: 'Parameter page undefined or null'
  }, {
    when: 'page parameter not object',
    params: [3, wh.one('source'), wh.one('contentType')],
    error: 'Parameter page is not a object'
  }]);
});
