var sendResponseDocument = require('app/lib/jsonapi/sendResponseDocument');

/**
 * Sends response document with 404 status code
 * @param {Object} res – Express response object
 */
module.exports = function(res) {
  sendResponseDocument(res, null, null, null, 404);
};
