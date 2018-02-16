var _ = require('app/lib/lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:jsonapi'),
  ObjectId = require('mongoose').Types.ObjectId,
  validateParams = require('app/lib/validateParams');

/**
 * Saves all provided relationships to document
 * @param {Object} document - Mongoose document
 * @param {Object} document - Key-value object of relationships
 * @param {callback} done
 */
module.exports = function(document, relationships, done) {
  var validate = function(done) {
    validateParams([{
      name: 'document', variable: document, required: true, requiredType: ['object', 'constructor']
    }, {
      name: 'relationships', variable: relationships, required: true, requiredType: ['object']
    }, {
      name: 'done', variable: done, required: true, requiredType: ['function']
    }], done);
  };

  var saveRelationshipsToDocument = function(done) {
    // eslint-disable-next-line global-require
    var Model = require(`app/models/${document.modelId()}`);
    
    async.forEachOf(relationships, function(relationship, relationshipName, done) {
      var validateRelationship = function(done) {
        var errors = [];

        if (!Model.schema.tree[relationshipName]) {
          errors.push(new Error(`Relationship name "${relationshipName}" is not valid`));
        } else if (Array.isArray(Model.schema.tree[relationshipName]) && !Model.schema.tree[relationshipName][0].ref) {
          errors.push(new Error(`Relationship name "${relationshipName}"is not valid`));
        } else if (!Array.isArray(Model.schema.tree[relationshipName]) && (typeof Model.schema.tree[relationshipName] !== 'object' || !Model.schema.tree[relationshipName].ref)) {
          errors.push(new Error(`Relationship name "${relationshipName}"is not valid`));
        }

        if (Array.isArray(Model.schema.tree[relationshipName]) && !Array.isArray(relationship.data)) {
          errors.push(new Error(`Relationship data should not be an array given name "${relationshipName}"`));
        }

        if (!Array.isArray(relationship.data) && Array.isArray(Model.schema.tree[relationshipName])) {
          errors.push(new Error(`Relationship data should be an array given name "${relationshipName}"`));
        }

        if (errors.length > 0) {
          var error = new Error(`Relationship "${relationshipName}" is not properly formatted`);
          error.errors = errors;
        }

        done(error);
      };

      var addRelationshipToDocument = function(done) {
        var validateAndAddResourceIdentifierObjectRelationship = function(resourceObject, done) {
          var validateResourceIdentifierObject = function(done) {
            var errors = [];

            if (!resourceObject.id) {
              errors.push(new Error(`Relationship resource identifier object for "${relationshipName}" does not have id property`));
            }

            if (!resourceObject.type) {
              errors.push(new Error(`Relationship resource identifier object for "${relationshipName}" does not have type property`));
            }

            var ref;

            if (Array.isArray(Model.schema.tree[relationshipName])) {
              ref = Model.schema.tree[relationshipName][0].ref;
            } else {
              ref = Model.schema.tree[relationshipName].ref;
            }

            // eslint-disable-next-line global-require
            var refModel = require(`app/models/${_.lowerFirst(ref)}`);

            if (refModel.modelType() !== _.camelCase(resourceObject.type)) {
              debug('mismatched types: %s %s', refModel.modelType(), resourceObject.type);
              errors.push(new Error(`Relationship resource identifier object type "${resourceObject.type}" is not valid`));
            }

            if (!ObjectId.isValid(resourceObject.id)) {
              errors.push(new Error(`Relationship resource identifier object ID "${resourceObject.id}" is not valid`));
            }

            if (errors.length > 0) {
              var error = new Error('Relationship resource identifier object is not properly formatted');
              error.errors = errors;
            }

            done(error);
          };

          var addResourceIdentifierToDocument = function(done) {
            if (Array.isArray(Model.schema.tree[relationshipName]) && document[relationshipName].indexOf(resourceObject.id) === -1) {
              document[relationshipName].push(resourceObject.id);
            } else if (!Array.isArray(Model.schema.tree[relationshipName])) {
              document[relationshipName] = resourceObject.id;
            }

            done();
          };

          async.series([validateResourceIdentifierObject, addResourceIdentifierToDocument], function(error) {
            done(error, document);
          });
        };

        if (Array.isArray(relationship.data)) {
          async.forEach(relationship.data, validateAndAddResourceIdentifierObjectRelationship, done);
        } else {
          validateAndAddResourceIdentifierObjectRelationship(relationship.data, done);
        }
      };

      async.series([validateRelationship, addRelationshipToDocument], done);
    }, done);
  };

  async.series([validate, saveRelationshipsToDocument], function(error) {
    done(error, document);
  });
};
