var modelQueryConditions = require('app/lib/jsonapi/modelQueryConditions');

/**
 * Callbacks Mongoose query conditions compiled from two separate conditions
 * Primary conditions are passed as parameter "conditions"
 * Secondary conditions are determined from model using route name
 * @param {Object} req - Express request object
 * @param {Object} conditions - Primary query conditions
 * @param {Object} model - Mongoose model (optional)
 * @param {string} method - HTTP method (optional)
 * @param {callback} done
 */
module.exports = function(req, conditions, model, method, done) {
  modelQueryConditions(req, model, method, (error, modelConditions) => {
    done(error, Object.assign({}, modelConditions, conditions));
  });
};
