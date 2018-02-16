var _ = require('app/lib/lodash'),
  resourceIdentifierObjectFromDocument = require('app/lib/jsonapi/resourceIdentifierObjectFromDocument'),
  validateParams = require('app/lib/validateParams');

/**
 * Add document as relationship to JSON API resource object
 * @param {Object} object - JSON API resource object
 * @param {Object} document - Mongoose document
 * @param {string} name - Name of relationship (e.g. "author")
 * @param {string} [type=to-many] - Type of relationship (either "to-many" or "to-one")
 */
module.exports = function(object, document, name, type) {
  validateParams([{
    name: 'object', variable: object, required: true, requiredType: 'object'
  }, {
    name: 'document', variable: document, required: true, requiredType: 'object'
  }, {
    name: 'name', variable: name, required: true, requiredType: 'string'
  }, {
    name: 'type', variable: type, requiredType: 'string'
  }]);

  name = _.kebabCase(name);

  if (!object.relationships) {
    object.relationships = {};
  }

  if (!object.relationships[name]) {
    object.relationships[name] = {};
  }

  type = type ? type : 'to-many';

  if (type === 'to-many') {
    if (!object.relationships[name].data) {
      object.relationships[name].data = [];
    }

    object.relationships[name].data.push(resourceIdentifierObjectFromDocument(document));
  } else if (type === 'to-one') {
    object.relationships[name].data = resourceIdentifierObjectFromDocument(document);
  } else {
    throw new Error('Type parameter is not valid');
  }
};
