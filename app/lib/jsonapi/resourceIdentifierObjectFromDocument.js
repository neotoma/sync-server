/**
 * Returns JSON API resource identifier object representing provided Mongoose document
 * @param {Object} document - Mongoose document
 * @returns {Object} object - JSON API relationship object
 */
module.exports = function(document) {
  if (!document) {
    throw new Error('No document provided');
  }

  return {
    id: document.id,
    type: document.modelType()
  };
};
