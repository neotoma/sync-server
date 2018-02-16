var _ = require('app/lib/lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:routeModelPostObjectResource'),
  normalizeRelationships = require('app/lib/jsonapi/normalizeRelationships'),
  routeModelResource = require('app/lib/jsonapi/routeModelResource'),
  saveRelationshipsToDocument = require('app/lib/jsonapi/saveRelationshipsToDocument'),
  sendDocument = require('app/lib/jsonapi/sendDocument'),
  sendError = require('app/lib/jsonapi/sendError'),
  validateQueryData = require('app/lib/jsonapi/validateQueryData');

/**
 * Routes POST requests to resource for individual resource objects for app and Model
 * @param {Object} app - Express app
 * @param {Object} Model - Mongoose model
 */
module.exports = function(app, Model) {
  routeModelResource(app, Model, 'post', '/'+ _.kebabCase(Model.modelType()), (req, res) => {
    /**
     * Validates all available attributes (TODO: and relationships)
     */
    var validate = (done) => {
      debug('POST validate');
      validateQueryData(req, req.body.data, Model, 'post', done);
    };

    /**
     * Creates the document with all available attributes
     */
    var createDocument = (done) => {
      debug('POST createDocument');

      try {
        var document = new Model(_.camelCasedKeys(req.body.data.attributes));
      } catch (error) {
        return done(error);
      }

      done(undefined, document);
    };

    /**
     * Adds all available relationships to document
     */
    var addRelationships = (document, done) => {
      if (!req.body.data.relationships) {
        return done(undefined, document);
      }

      saveRelationshipsToDocument(document, normalizeRelationships(req.body.data.relationships), function(error) {
        done(error, document);
      });
    };

    /**
     * Saves the document
     */
    var saveDocument = (document, done) => {
      document.save((error) => {
        done(error, document);
      });
    };

    /**
     * Reloads the document to ensure all autopopulate references are populated
     */
    var reloadDocument = (document, done) => {
      Model.findById(document.id, (error, document) => {
        done(error, document);
      });
    };

    /**
     * Executes any available post-POST routine available for Model
     */
    var executePostRoutine = (document, done) => {
      if (Model.jsonapi.post && Model.jsonapi.post.post) {
        Model.jsonapi.post.post(req, res, document, function(error) {
          done(error, document);
        });
      } else {
        done(undefined, document);
      }
    };

    async.waterfall([
      validate,
      createDocument,
      addRelationships,
      saveDocument,
      reloadDocument,
      executePostRoutine
    ], (error, document) => {
      if (error) {
        if (error.errors) {
          return sendError(res, error, 400);
        }

        return sendError(res, error);
      }

      if (!document) {
        return sendError(res, 'Failed to create resource object for unknown reason');
      }

      sendDocument(res, document, 201);
    });
  });
};
