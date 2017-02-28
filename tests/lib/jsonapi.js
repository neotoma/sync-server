require('../../lib/env')('test');
var assertions = require('../../assertions');
var jsonapi = require('../../lib/jsonapi');

describe('jsonapi', () => {
  assertions.object.hasProperties('jsonapi', jsonapi, [
    'allowed',
    'compiledQueryConditions',
    'modelQueryConditions',
    'routeModelDeleteObjectResource',
    'routeModelGetObjectResource',
    'routeModelGetObjectsResource',
    'routeModelPatchObjectResource',
    'routeModelPostObjectResource',
    'routeModelResource',
    'routeModelResources',
    'routeResource',
    'saveRelationshipsToDocument',
    'validateQueryData',
    'validateRequestBody',
    'validateRequestUrl'
  ]);

  var method = 'get';
  var model = {
    jsonapi: {
      get: 'public'
    },
    modelId: () => {
      return 'testModelId';
    }
  };
  var req = {};

  assertions.function.throws.error('jsonapi.modelQueryConditions', jsonapi.modelQueryConditions, [{
    when: 'no req parameter provided',
    params: [undefined, model, method],
    error: 'Parameter req undefined or null'
  }, {
    when: 'no model parameter provided',
    params: [req, undefined, method],
    error: 'Parameter model undefined or null'
  }, {
    when: 'no method parameter provided',
    params: [req, model, undefined],
    error: 'Parameter method undefined or null'
  }, {
    when: 'model parameter has no jsonapi property',
    params: [req, model, method],
    error: 'Parameter model has no jsonapi property', 
    before: function(done) {
      var model = Object.assign({}, this.params[1]);
      delete model.jsonapi;
      this.params[1] = model;
      done();
    }
  }]);

  assertions.function.callbacks.result('jsonapi.modelQueryConditions', jsonapi.modelQueryConditions, [{
    when: 'model with no jsonapi[method] property provided',
    params: [req, model, method],
    result: {},
    before: function(done) {
      var model = Object.assign({}, this.params[1]);
      delete model.jsonapi[this.params[2]];
      this.params[1] = model;
      done();
    }
  }]);

  it('responds with JSON API content type header');
  it('sends 415 status when receiving requests with modified JSON API content type header');
  it('sends 406 status when receiving requests with modified JSON API accept header');
  it('responds with jsonapi object');
  it('routes GET requests for resource objects');
  it('routes GET requests for resource object');
  it('routes POST requests for resource object');
  it('routes DELETE requests for resource object');

  it('responds with errors');
});