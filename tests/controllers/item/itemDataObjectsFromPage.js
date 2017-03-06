require('dotenvs')('test');
var _ = require('lodash');
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var wh = require('app/lib/warehouse');

describe('itemController.itemDataObjectsFromPage method', () => {
  assertions.function.returnsResult('controller.itemDataObjectsFromPage', controller.itemDataObjectsFromPage, [{
    when: 'provided source with itemDataObjectsFromPagePathTemplate property as parameter',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    before: function(done) {
      this.params[0] = wh.itemPage(this.params[1], this.params[2]);
      this.result = _.get(this.params[0], this.params[1].itemDataObjectsFromPagePath(this.params[2]));
      done();
    }
  }, {
    when: 'provided source without itemDataObjectsFromPagePathTemplate property as parameter',
    params: [undefined, wh.one('source'), wh.one('contentType')],
    before: function(done) {
      this.params[1] = wh.one('source', {
        itemDataObjectsFromPagePathTemplate: undefined
      });

      this.params[0] = wh.itemPage(this.params[1], this.params[2]);
      this.result = _.get(this.params[0], this.params[1].itemDataObjectsFromPagePath(this.params[2]));
      done();
    }
  }]);

  assertions.function.throws.error('controller.itemDataObjectsFromPage', controller.itemDataObjectsFromPage, [{
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
  }, {
    when: 'source parameter has no itemDataObjectsFromPagePathTemplate property',
    params: [{}, {}, wh.one('contentType')],
    error: 'Parameter source has no itemDataObjectsFromPagePathTemplate property'
  }]);
});