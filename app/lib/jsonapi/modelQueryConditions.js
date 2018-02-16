var debug = require('app/lib/debug')('app:jsonapi'),
  validateParams = require('app/lib/validateParams');

/**
 * Callbacks a model's query conditions given request user status
 * @param {Object} req - Express request object
 * @param {Object} model - Mongoose model
 * @param {string} method - HTTP method (optional)
 * @param {callback} done
 */
module.exports = function(req, model, method, done) {
  validateParams([{
    name: 'req', variable: req, required: true
  }, {
    name: 'model', variable: model, required: true, requiredProperties: ['jsonapi']
  }, {
    name: 'method', variable: method, required: true
  }]);

  debug('modelQueryConditions %s, %s', model.modelId(), method);

  if (model.jsonapi[method] && model.jsonapi[method].queryConditions) {
    var queryConditions = model.jsonapi[method].queryConditions;

    if (typeof queryConditions === 'object' && (queryConditions.public || queryConditions.user || queryConditions.admin)) {
      if (!req.user && queryConditions.public) {
        done(undefined, queryConditions.public);
      } else if (req.user && req.user.admin && queryConditions.admin) {
        done(undefined, queryConditions.admin);
      } else if (req.user && !req.user.admin && queryConditions.user) {
        done(undefined, queryConditions.user);
      }
    } else if (typeof queryConditions === 'function') {
      model.jsonapi[method].queryConditions(req, done);
    } else {
      done(undefined, queryConditions);
    }
  } else {
    done(undefined, {});
  }
};
