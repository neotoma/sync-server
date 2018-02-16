var _ = require('app/lib/lodash'),
  async = require('async'),
  compiledQueryConditions = require('app/lib/jsonapi/compiledQueryConditions'),
  normalizeRelationships = require('app/lib/jsonapi/normalizeRelationships'),
  routeModelResource = require('app/lib/jsonapi/routeModelResource'),
  saveRelationshipsToDocument = require('app/lib/jsonapi/saveRelationshipsToDocument'),
  sendError = require('app/lib/jsonapi/sendError'),
  sendDocument = require('app/lib/jsonapi/sendDocument'),
  sendNotFound = require('app/lib/jsonapi/sendNotFound'),
  validateQueryData = require('app/lib/jsonapi/validateQueryData');

/**
 * Routes PATCH requests to resource for individual resource objects for app and Model
 * @param {Object} app - Express app
 * @param {Object} Model - Mongoose model
 */
module.exports = function(app, Model) {
  routeModelResource(app, Model, 'patch', '/' + _.kebabCase(Model.modelType()) + '/:id', (req, res) => {
    var validate = (done) => {
      validateQueryData(req, req.body.data, Model, 'patch', done);
    };

    var getConditions = (done) => {
      compiledQueryConditions(req, { _id: req.params.id }, Model, 'patch', done);
    };

    var findOneAndUpdate = (conditions, done) => {
      Model.findOneAndUpdate(conditions, _.camelCasedKeys(req.body.data.attributes), { new: true }, done);
    };

    var addRelationships = (document, done) => {
      if (!document) {
        return done(new Error('No document found with ID'));
      }

      if (!req.body.data.relationships) {
        return done(undefined, document);
      }

      saveRelationshipsToDocument(document, normalizeRelationships(req.body.data.relationships), function(error) {
        done(error, document);
      });
    };

    var saveDocument = (document, done) => {
      document.save((error) => {
        done(error, document);
      });
    };

    var executePostRoutine = (document, done) => {
      if (Model.jsonapi.patch && Model.jsonapi.patch.post) {
        Model.jsonapi.patch.post(req, res, document, function(error, req, res, document) {
          done(error, document);
        });
      } else {
        done(undefined, document);
      }
    };

    async.waterfall([
      validate,
      getConditions,
      findOneAndUpdate,
      addRelationships,
      saveDocument,
      executePostRoutine
    ], (error, document) => {
      if (error) {
        if (error.errors) {
          return sendError(res, error, 400);
        }

        if (error.message === 'No document found with ID') {
          sendNotFound(res);
        } else {
          sendError(res, error, 500);
        }
      } else {
        sendDocument(res, document, 200);
      }
    });
  });
};
