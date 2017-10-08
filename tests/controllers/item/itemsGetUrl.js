require('park-ranger')();
var assert = require('assert');
var assertions = require('app/lib/assertions');
var controller = require('app/controllers/item');
var templateCompiler = require('es6-template-strings');
var wh = require('app/lib/warehouse');

describe('itemController.itemsGetUrl method', function() {
  assertions.function.returnsResult('controller.itemsGetUrl', controller.itemsGetUrl, [{
    when: 'provided source (with itemsGetUrlTemplate property), sourceContentType, userSourceAuth, and pagination as parameters',
    params: [wh.one('source'), wh.one('sourceContentType'), wh.one('userSourceAuth'), wh.pagination()],
    result: function(itemsGetUrl, done) {
      assert.equal(itemsGetUrl, templateCompiler(this.params[0].itemsGetUrlTemplate, {
        host: this.params[0].host,
        contentTypePluralCamelName: this.params[1].pluralCamelName(),
        accessToken: this.params[2].sourceToken,
        limit: this.params[0].itemsLimit,
        offset: this.params[3].offset
      }));
      done();
    }
  }, {
    when: 'provided source (without itemsGetUrlTemplate property), sourceContentType, userSourceAuth, and pagination as parameters',
    params: [wh.one('source'), wh.one('sourceContentType'), wh.one('userSourceAuth'), wh.pagination()],
    result: function(itemsGetUrl, done) {
      assert.equal(itemsGetUrl, templateCompiler('https://${host}/${contentTypePluralCamelName}?access_token=${accessToken}&limit=${limit}&offset=${offset}', {
        host: this.params[0].host,
        contentTypePluralCamelName: this.params[1].pluralCamelName(),
        accessToken: this.params[2].sourceToken,
        limit: this.params[0].itemsLimit,
        offset: this.params[3].offset
      }));
      done();
    },
    before: function(done) {
      this.params[0] = wh.one('source', {
        itemsGetUrlTemplate: undefined
      });

      done();
    }
  }]);

  assertions.function.throws.error('controller.itemsGetUrl', controller.itemsGetUrl, [{
    when: 'no source parameter provided',
    params: [undefined, wh.one('sourceContentType'), wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no host property',
    params: [{}, wh.one('sourceContentType'), wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter source has no host property'
  }, {
    when: 'no sourceContentType parameter provided',
    params: [wh.one('source'), undefined, wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter sourceContentType undefined or null'
  }, {
    when: 'sourceContentType parameter has no name property',
    params: [wh.one('source'), {}, wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter sourceContentType has no name property'
  }, {
    when: 'no userSourceAuth parameter provided',
    params: [wh.one('source'), wh.one('sourceContentType'), undefined, wh.pagination()],
    error: 'Parameter userSourceAuth undefined or null'
  }, {
    when: 'userSourceAuth parameter has no sourceToken property',
    params: [wh.one('source'), wh.one('sourceContentType'), {}, wh.pagination()],
    error: 'Parameter userSourceAuth has no sourceToken property'
  }]);
});