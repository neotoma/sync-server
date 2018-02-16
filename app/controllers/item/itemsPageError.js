var validateParams = require('app/lib/validateParams');

/**
 * Returns error from items page if error exists within.
 * @param {Object} page - Items page.
 * @returns {error} Error
 */
module.exports = function(page) {
  validateParams([{
    name: 'page', variable: page, required: true, requiredType: 'object'
  }]);

  if (page.meta && page.meta.code && Number(page.meta.code) >= 400) {
    var message;

    if (page.meta.errorDetail) {
      message = `${page.meta.errorDetail} (${page.meta.code})`;
    } else if (page.meta.errorType) {
      message = `HTTP status code ${page.meta.code}, ${page.meta.errorType}`;
    } else {
      message = `HTTP status code ${page.meta.code}`;
    }

    return new Error(message);
  }
};
