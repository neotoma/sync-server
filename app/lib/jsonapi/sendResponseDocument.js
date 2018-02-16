var responseDocument = require('app/lib/jsonapi/responseDocument');

/**
 * Sends response document with principal data, included resources or errors
 * @param {Object} res – Express response object
 * @param {Object} data – Principal data (optional)
 * @param {Object} included – Included resources (optional)
 * @param {Object} errors - Errors (optional)
 * @param {number} [status=200] - HTTP status code
 */
module.exports = function(res, data, included, errors, status) {
  if (!status) {
    status = 200;
  }

  res.status(status).json(responseDocument(data, included, errors));
};
