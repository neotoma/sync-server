require('../../../lib/env')('test');
var _ = require('lodash');
var assert = require('assert');
var assertions = require('../../../assertions');
var controller = require('../../../controllers/item');
var wh = require('../../../lib/warehouse');

describe('itemController.itemsPageNextPagination method', () => {
  assertions.function.returnsResult('controller.itemsPageNextPagination', controller.itemsPageNextPagination, [{
    when: 'provided page with no response',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      delete this.params[0].response;
      done();
    },
    result: undefined
  }, {
    when: 'provided page with response containing no contentType-based property',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[0].response = {};
      done();
    },
    result: undefined
  }, {
    when: 'provided page with response containing contentType-based property without length',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      _.set(this.params[0], `response.${wh.one('contentType').pluralLowercaseName()}.items`, 3);
      done();
    },
    result: undefined
  }, {
    when: 'provided page with response containing contentType-based property with length',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[1] = {};
      _.set(this.params[0], `response.${wh.one('contentType').pluralLowercaseName()}.items`, [1,2,3]);
      done();
    },
    result: { offset: 3 }
  }, {
    when: 'provided pagination with offset and page with response containing contentType-based property with length',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[1] = { offset: 5 };
      _.set(this.params[0], `response.${wh.one('contentType').pluralLowercaseName()}.items`, [1,2,3]);
      done();
    },
    result: { offset: 8 }
  }, {
    when: 'provided page with response containing data property',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[1] = {};
      this.params[0] = { data: {} };
      done();
    },
    result: undefined
  }, {
    when: 'provided page with response containing data property with pagination property',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[1] = {};
      this.params[0] = { data: { pagination: { } } };
      done();
    },
    result: undefined
  }, {
    when: 'provided page with response containing data property with pagination property with next_max_id property',
    params: [wh.itemPage(), wh.pagination(), wh.one('contentType')],
    before: function(done) {
      this.params[1] = {};
      this.params[0] = { data: { pagination: { next_max_id: 999 } } };
      done();
    },
    result: { maxId: 999 }
  }]);

  assertions.function.throws.error('controller.itemsPageNextPagination', controller.itemsPageNextPagination, [{
    when: 'no page parameter provided',
    params: [undefined, wh.pagination(), wh.one('contentType')],
    error: 'Parameter page undefined or null'
  }, {
    when: 'page parameter not object',
    params: [3, wh.pagination(), wh.one('contentType')],
    error: 'Parameter page is not a object'
  }, {
    when: 'contentType parameter has no pluralCamelName property',
    params: [wh.itemPage(), wh.pagination(), {}],
    error: 'Parameter contentType has no pluralCamelName property'
  }]);
});