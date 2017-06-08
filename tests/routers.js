/**
 * Run tests against all model routers available as fixtures
 * @module
 */

require('park-ranger')();

var _ = require('lodash');
var assertions = require('app/lib/assertions');
var async = require('async');
var createPopulatedProperties = require('app/lib/createPopulatedProperties');
var fixtures = require('fixtures/models');
var methods = require('methods');
var models = require('app/models');
var mongoose = require('app/lib/mongoose');

Object.keys(fixtures).forEach((id) => {
  var Model = models[id];
  var modelFixture = fixtures[id];
  var modelName = modelFixture.name;
  var modelType = modelFixture.type;
  var properties = modelFixture.mockProperties();

  describe(`${modelName} /${_.kebabCase(modelType)}`, function() {
    beforeEach((done) => {
      async.series([mongoose.removeAllCollections, createPopulatedProperties(modelFixture, properties)], done);
    });

    methods.forEach((method) => {
      if (!modelFixture.jsonapi || !modelFixture.jsonapi[method]) { return; }
      
      var methodProperties = modelFixture.jsonapi[method].queryConditions ? Object.assign({}, properties, modelFixture.jsonapi[method].queryConditions) : properties;
      
      var tests = [{
        when: 'request body missing data',
        status: 400,
        requestBody: {},
        error: new Error('Data value not provided top-level in body of request')
      }, {
        when: 'request body missing data.attributes',
        status: 400,
        requestBody: { data: {} },
        error: new Error('Attributes value not provided within data value of request')
      }, {
        when: 'request body missing data.type',
        status: 400,
        requestBody: { data: {} },
        error: new Error('Type value not provided within data value of request')
      }];

      if (modelFixture.schemaProperties) {
        Object.keys(modelFixture.schemaProperties).forEach((schemaPropertyName) => {
          var schemaProperty = modelFixture.schemaProperties[schemaPropertyName];

          if (schemaProperty.required) {
            tests.push({
              when: `request body missing data.attributes.${schemaPropertyName}`,
              status: 400,
              requestBody: {
                data: {
                  type: _.kebabCase(Model.modelType()),
                  attributes: {}
                }
              },
              error: new Error(`Path \`${schemaPropertyName}\` is required.`)
            });
          }
        });
      }

      tests.push({
        when: 'request body contains valid attributes',
        status: (method === 'post' ? 201 : 200),
        requestBody: {
          data: {
            type: _.kebabCase(Model.modelType()),
            attributes: methodProperties
          }
        }
      });

      if (modelFixture.jsonapi[method] !== 'public' && modelFixture.jsonapi[method].allowed !== 'public') {
        return;
      }

      if (['patch', 'post'].indexOf(method) > -1) {
        assertions.route(Model, method, tests);
      }

      if (id === 'contactVerificationRequest') {
        if (method === 'post') {
          it('POST requests to ${modelName} respond with status 400 when request body contains invalid contact attribute');
          it('POST requests to ${modelName} respond with status 400 when request body contains missing clientOrigin attribute');
        } else if (method === 'patch') {
          it('PATCH requests to ${modelName} respond with status 200 and result in expected changes when related contactVerificationRequest exists');
          it('PATCH requests to ${modelName} respond with status 200 and result in expected changes when related contactVerificationRequest has createUser and authenticateSession set to true');
          it('PATCH requests to ${modelName} respond with status 200 and result in expected changes when related contactVerificationRequest has createUser set to true');
          it('PATCH requests to ${modelName} respond with status 200 and result in expected changes when related contactVerificationRequest has authenticateSession set to true');
          it('PATCH requests to ${modelName} respond with status 500 when related contactVerificationRequest has authenticateSession set to true and no user with related email existed previously');
          it('PATCH requests to ${modelName} respond with status 500 when related contactVerificationRequest does not exist');
        }
      }
    });

    it(`public requests to ${modelName} routes restricted to admins respond with status 403`);
    it(`user requests to ${modelName} routes restricted to admins respond with status 403`);
    it(`admin requests to ${modelName} routes restricted to admins respond with status 2xx`);
    it(`public requests to ${modelName} routes restricted to user respond with status 403`);
    it(`user requests to ${modelName} routes restricted to user respond with status 2xx`);
    it(`admin requests to ${modelName} routes restricted to user respond with status 2xx`);

    it(`responses to requests for ${modelName} do not contain filteredProperties`);
    
    it(`POST requests to ${modelName} respond with status 400 when request body contains invalid attribute`);
    it(`PATCH requests to ${modelName} respond with status 400 when request body contains invalid attribute`);
  });
});