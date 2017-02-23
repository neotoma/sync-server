require('../../../lib/env')('test');
var _ = require('lodash');
var assertions = require('../../../assertions');
var controller = require('../../../controllers/item');
var wh = require('../../../lib/warehouse');

describe('itemController.totalItemsAvailableFromPage', () => {
  assertions.function.returnsResult(controller.totalItemsAvailableFromPage, [{
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

  assertions.function.throws.error(controller.totalItemsAvailableFromPage, [{
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