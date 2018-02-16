require('park-ranger')();

var assert = require('assert'),
  assertFunctionReturnsResult = require('app/lib/assertions/functionReturnsResult'),
  assertFunctionThrowsError = require('app/lib/assertions/functionThrowsError'),
  itemsGetUrl = require('app/controllers/item/itemsGetUrl'),
  templateCompiler = require('es6-template-strings'),
  wh = require('app/lib/warehouse');

describe('itemController itemsGetUrl method', function() {
  assertFunctionReturnsResult('controller itemsGetUrl', itemsGetUrl, [{
    when: 'provided source (with itemsGetUrlTemplate property), contentType, userSourceAuth, and pagination as parameters',
    params: [wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), wh.pagination()],
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
    when: 'provided source (without itemsGetUrlTemplate property), contentType, userSourceAuth, and pagination as parameters',
    params: [wh.one('source'), wh.one('contentType'), wh.one('userSourceAuth'), wh.pagination()],
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

  assertFunctionThrowsError('controller itemsGetUrl', itemsGetUrl, [{
    when: 'no source parameter provided',
    params: [undefined, wh.one('contentType'), wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter source undefined or null'
  }, {
    when: 'source parameter has no host property',
    params: [{}, wh.one('contentType'), wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter source has no host property'
  }, {
    when: 'no contentType parameter provided',
    params: [wh.one('source'), undefined, wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter contentType undefined or null'
  }, {
    when: 'contentType parameter has no name property',
    params: [wh.one('source'), {}, wh.one('userSourceAuth'), wh.pagination()],
    error: 'Parameter contentType has no name property'
  }, {
    when: 'no userSourceAuth parameter provided',
    params: [wh.one('source'), wh.one('contentType'), undefined, wh.pagination()],
    error: 'Parameter userSourceAuth undefined or null'
  }, {
    when: 'userSourceAuth parameter has no sourceToken property',
    params: [wh.one('source'), wh.one('contentType'), {}, wh.pagination()],
    error: 'Parameter userSourceAuth has no sourceToken property'
  }]);
});
