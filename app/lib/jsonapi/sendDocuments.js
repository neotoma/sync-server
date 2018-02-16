var resourceObjectFromDocument = require('app/lib/jsonapi/resourceObjectFromDocument'),
  sendResponseDocument = require('app/lib/jsonapi/sendResponseDocument');

/**
 * Sends response document with model documents
 * @param {Object} res – Express response object
 * @param {Object} documents - Array of model documents
 */
module.exports = function(res, documents) {
  var objects = documents.map((document) => {
    return resourceObjectFromDocument(document);
  });

  sendResponseDocument(res, objects);
};
