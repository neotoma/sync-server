var sendResponseDocument = require('./sendResponseDocument'),
  resourceObjectFromDocument = require('./resourceObjectFromDocument');

/**
 * Sends response document with model document
 * @param {Object} res – Express response object
 * @param {Object} document - Model document
 * @param {number} status - HTTP status code
 */
module.exports = function(res, document, status) {
  sendResponseDocument(res, resourceObjectFromDocument(document), null, null, status);
};
