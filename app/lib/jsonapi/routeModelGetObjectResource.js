var _ = require('app/lib/lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:jsonapi'),
  logger = require('app/lib/logger'),
  compiledQueryConditions = require('app/lib/jsonapi/compiledQueryConditions'),
  routeModelResource = require('app/lib/jsonapi/routeModelResource'),
  sendDocument = require('app/lib/jsonapi/sendDocument'),
  sendError = require('app/lib/jsonapi/sendError'),
  sendNotFound = require('app/lib/jsonapi/sendNotFound');

/**
 * Routes GET requests to resource for individual resource objects for app and model
 * @param {Object} app - Express app
 * @param {model} model - Mongoose model
 */
module.exports = function(app, Model) {
  routeModelResource(app, Model, 'get', '/' + _.kebabCase(Model.modelType()) + '/:id', (req, res) => {
    var getConditions = (done) => {
      compiledQueryConditions(req, { _id: req.params.id }, Model, 'get', done);
    };

    var findOne = (conditions, done) => {
      debug('GET findOne %O', conditions);
      Model.findOne(conditions, done);
    };

    async.waterfall([getConditions, findOne], (error, document) => {
      if (error) {
        logger.error('Resource router failed to query for object', { model: Model.modelName, error: error.message });
        sendError(res);
      } else if (!document) {
        sendNotFound(res);
      } else {
        sendDocument(res, document);
      }
    });
  });
};
