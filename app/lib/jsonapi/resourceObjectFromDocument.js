var _ = require('app/lib/lodash');

/**
 * Returns JSON API resource object representing provided Mongoose document
 * Document properties filtered out per model settings
 * @param {Object} document - Mongoose document
 * @returns {Object} object - JSON API resource object
 */
module.exports = function(document) {
  if (!document) {
    throw new Error('No document provided');
  }

  // eslint-disable-next-line global-require
  var Model = require(`app/models/${document.modelId()}`);

  if (!Model) {
    throw new Error(`Unable to determine model for document with modelID "${document.modelId()}"`);
  }

  var attributes = document.toObject();
  delete attributes.id;

  var relationships = {};

  Object.keys(attributes).forEach(function(key) {
    var addRelationship = function(property) {
      if (property && property.id && property.modelType) {
        if (!relationships[key] || !relationships[key].data) {
          if (Array.isArray(document[key])) {
            relationships[key] = { data: [] };
          } else {
            relationships[key] = { data: {} };
          }
        }

        var relationship = {
          id: property.id,
          type: property.modelType()
        };

        if (Array.isArray(document[key])) {
          relationships[key].data.push(relationship);
        } else {
          relationships[key].data = relationship;
        }

        delete attributes[key];
      }
    };

    if (Array.isArray(document[key])) {
      if (document[key].length < 1) {
        delete attributes[key];
      } else {
        document[key].forEach(addRelationship);
      }
    } else {
      addRelationship(document[key]);
    }
  });

  attributes = _.mapKeys(attributes, (value, key) => {
    return _.kebabCase(key);
  });

  if (Model.jsonapi.filteredProperties) {
    Model.jsonapi.filteredProperties.forEach((name) => {
      delete attributes[name];
      delete attributes[_.kebabCase(name)];
      delete attributes[_.camelCase(name)];
    });
  }

  relationships = _.mapKeys(relationships, (value, key) => {
    return _.kebabCase(key);
  });

  return {
    id: document.id,
    type: document.modelType(),
    attributes: attributes,
    relationships: Object.getOwnPropertyNames(relationships).length > 0 ? relationships : undefined
  };
};
