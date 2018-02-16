var _ = require('app/lib/lodash'),
  async = require('async'),
  compiledQueryConditions = require('app/lib/jsonapi/compiledQueryConditions'),
  routeModelResource = require('app/lib/jsonapi/routeModelResource'),
  sendError = require('app/lib/jsonapi/sendError'),
  sendNotFound = require('app/lib/jsonapi/sendNotFound');

/**
 * Routes DELETE requests to resource for individual resource objects for app and Model
 * @param {Object} app - Express app
 * @param {Object} Model - Mongoose model
 */
module.exports = function(app, Model) {
  routeModelResource(app, Model, 'delete', '/' + _.kebabCase(Model.modelType()) + '/:id', (req, res) => {
    var getConditions = (done) => {
      compiledQueryConditions(req, { _id: req.params.id }, Model, 'delete', done);
    };

    var findOne = (conditions, done) => {
      Model.findOne(conditions, done);
    };

    async.waterfall([getConditions, findOne], (error, document) => {
      if (error) {
        sendError(res, error);
      } else if (!document) {
        sendNotFound(res);
      } else {
        document.remove(function(error) {
          if (error) {
            res.status(500).send();
          } else {
            res.status(204).send();
          }
        });
      }
    });
  });
};
