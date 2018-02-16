var sendResponseDocument = require('app/lib/jsonapi/sendResponseDocument');

/**
 * Sends response document with principal data and included resources
 * @param {Object} res – Express response object
 * @param {Object} data – Principal data
 * @param {Object} included – Included resources (optional)
 */
module.exports = function(res, data, included) {
  if (!data) {
    throw new Error('No data parameter provided');
  }

  sendResponseDocument(res, data, included);
};
