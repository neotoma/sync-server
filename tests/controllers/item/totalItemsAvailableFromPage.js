require('park-ranger')();

var _ = require('lodash'),
  assertFunctionReturnsResult = require('app/lib/assertions/functionReturnsResult'),
  assertFunctionThrowsError = require('app/lib/assertions/functionThrowsError'),
  totalItemsAvailableFromPage = require('app/controllers/item/totalItemsAvailableFromPage'),
  wh = require('app/lib/warehouse');

describe('itemController totalItemsAvailableFromPage', () => {
  assertFunctionReturnsResult(totalItemsAvailableFromPage, [{
    when: 'provided source with totalItemsAvailableFromPagePathTemplate property as parameter',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    before: function(done) {
      this.params[0] = wh.itemPage(this.params[1], this.params[2]);
      this.result = _.get(this.params[0], this.params[1].totalItemsAvailableFromPagePath(this.params[2]));
      done();
    }
  }, {
    when: 'provided source without totalItemsAvailableFromPagePathTemplate property as parameter',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    before: function(done) {
      this.params[1] = wh.one('source', {
        totalItemsAvailableFromPagePathTemplate: undefined
      });
      
      this.params[0] = wh.itemPage(this.params[1], this.params[2]);
      this.result = _.get(this.params[0], this.params[1].totalItemsAvailableFromPagePath(this.params[2]));
      done();
    }
  }]);

  assertFunctionThrowsError(totalItemsAvailableFromPage, [{
    when: 'no page parameter provided',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    error: 'Parameter page undefined or null'
  }, {
    when: 'page parameter not object',
    params: [3, wh.one('source'), wh.one('contentType')],
    error: 'Parameter page is not a object'
  }, {
    when: 'no source parameter provided',
    params: [{}, undefined, wh.one('contentType')],
    error: 'Parameter source undefined or null'
  }]);
});
