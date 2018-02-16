/**
 * Returns allowed requester type value for model and method
 * @param {Object} model - Mongoose model
 * @param {string} method - HTTP method
 * @returns {string} allowed value (e.g. "public", "user", or "admin)
 */
module.exports = function(model, method) {
  if (typeof model.jsonapi[method] === 'string') {
    return model.jsonapi[method];
  } else if (typeof model.jsonapi[method] === 'object') {
    return model.jsonapi[method].allowed;
  }
};
