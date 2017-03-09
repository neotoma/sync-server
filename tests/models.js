/**
 * Run tests against all models available as fixtures
 * @module
 */

require('dotenvs')('test');
var assert = require('assert');
var assertions = require('app/lib/assertions');
var async = require('async');
var createPopulatedProperties = require('app/lib/createPopulatedProperties');
var fixtures = require('fixtures/models');
var models = require('app/models');
var mongoose = require('app/lib/mongoose');
var options = require('app/lib/minimist');
var templateCompiler = require('es6-template-strings');
var unpopulatedProperties = require('app/lib/unpopulatedProperties');
var wh = require('app/lib/warehouse');

if (options.model) {
  var fixture = fixtures[options.model];
  fixtures = {};
  fixtures[options.model] = fixture;
}

var conditionProperties = function(modelFixture, properties) {
  if (!modelFixture.nonConditionProperties) {
    return properties;
  }

  var nonConditionProperties = Object.assign({}, properties);

  modelFixture.nonConditionProperties.forEach((property) => {
    delete nonConditionProperties[property];
  });

  return nonConditionProperties;
};

Object.keys(fixtures).forEach((id) => {
  var modelFixture = fixtures[id];
  var Model = models[id];
  var modelName = modelFixture.name;
  var properties = modelFixture.mockProperties();

  describe(modelName + ' model', () => {
    beforeEach((done) => {
      async.series([mongoose.removeAllCollections, createPopulatedProperties(modelFixture, properties)], done);
    });

    assertions.object.hasProperty(modelName + ' model', Model, 'modelName', modelName);
    assertions.object.method.returnsResult(modelName + ' model', Model, 'modelType', modelFixture.type);
    assertions.object.method.returnsResult(modelName + ' model', Model, 'modelId', id);
    assertions.object.hasProperties(modelName + ' document', new Model(properties), unpopulatedProperties(properties));
    assertions.object.savesAndHasProperties(modelName + ' document', new Model(properties), ['id', 'createdAt', 'updatedAt']);
    assertions.object.toObjectMethodReturnsProperties(modelName + ' document', new Model(properties), unpopulatedProperties(properties));
    assertions.object.method.returnsResult(modelName + ' document', new Model(properties), 'modelType', Model.modelType());
    assertions.object.method.returnsResult(modelName + ' document', new Model(properties), 'modelId', id);

    it(modelName + ' document can be created then found with ' + modelName + ' model method findOrCreate', (done) => {
      properties = conditionProperties(modelFixture, properties);

      var create = function(done) {
        Model.findOrCreate(properties, (error, document) => {
          if (error) { return done(error); }

          try {
            assert(document);
            done(undefined, document);
          } catch (error) {
            return done(new Error('Document not created'));
          }
        });
      };

      var find = function(document, done) {
        Model.findOrCreate(properties, (error, foundDocument) => {
          if (error) { return done(error); }

          try {
            assert.equal(document.id, foundDocument.id);
            done();
          } catch (error) {
            return done(new Error(`Document found does not match one created: ${foundDocument.id} !== ${document.id}`));
          }
        });
      };

      async.waterfall([create, find], done);
    });

    it('has functional static methods');
    it('has functional instance methods');

    if (id === 'storage') {
      assertions.function.returnsResult('storage.itemPutUrl', wh.one('storage').itemPutUrl, [{
        context: wh.one('storage'),
        when: 'given path and userStorageAuth for storage with itemPutUrlTemplate',
        params: ['/foo', wh.one('userStorageAuth')],
        result: function(itemPutUrl, done) {
          assert.equal(itemPutUrl, templateCompiler('https://${host}/test-path${path}?foo=bar&access_token=${accessToken}', {
            host: this.context.host,
            path: this.params[0],
            accessToken: this.params[1].storageToken
          }));
          done();
        }
      }, {
        context: wh.one('storage'),
        when: 'given path and userStorageAuth for storage without itemPutUrlTemplate',
        params: ['/foo', wh.one('userStorageAuth')],
        result: function(itemPutUrl, done) {
          assert.equal(itemPutUrl, templateCompiler('https://${host}${path}?access_token=${accessToken}', {
            host: this.context.host,
            path: this.params[0],
            accessToken: this.params[1].storageToken
          }));
          done();
        },
        before: function(done) {
          this.context = wh.one('storage', {
            itemPutUrlTemplate: undefined
          });

          done();
        }
      }]);

      assertions.function.throws.error('storage.itemPutUrl', wh.one('storage').itemPutUrl, [{
        context: wh.one('storage'),
        when: 'no path parameter provided',
        params: [undefined, wh.one('userStorageAuth')],
        error: 'Parameter path undefined or null'
      }, {
        context: wh.one('storage'),
        when: 'path parameter not a string',
        params: [3, wh.one('userStorageAuth')],
        error: 'Parameter path is not a string'
      }, {
        context: wh.one('storage'),
        when: 'no userStorageAuth parameter provided',
        params: ['/foo', undefined],
        error: 'Parameter userStorageAuth undefined or null'
      }, {
        context: wh.one('storage'),
        when: 'userStorageAuth parameter has no storageToken property',
        params: ['/foo', {}],
        error: 'Parameter userStorageAuth has no storageToken property'
      }]);
    }
  });
});