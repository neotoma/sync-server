var _ = require('app/lib/lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:jsonapi'),
  logger = require('app/lib/logger'),
  ObjectId = require('mongoose').Types.ObjectId,
  compiledQueryConditions = require('app/lib/jsonapi/compiledQueryConditions'),
  routeModelResource = require('app/lib/jsonapi/routeModelResource'),
  sendDocuments = require('app/lib/jsonapi/sendDocuments'),
  sendError = require('app/lib/jsonapi/sendError');

/**
 * Routes GET requests to resource for collections of resource objects for app and model
 * @param {Object} app - Express app
 * @param {model} model - Mongoose model
 */
module.exports = function(app, Model) {
  routeModelResource(app, Model, 'get', '/' + _.kebabCase(Model.modelType()), (req, res) => {
    var compileConditions = (done) => {
      var conditions = {};
      var filter = req.query.filter ? req.query.filter : {};
      
      try {
        if (filter.relationships) {
          Object.keys(filter.relationships).forEach((modelName) => {
            conditions[modelName] = ObjectId(filter.relationships[modelName].id);
          });
        }
      } catch (error) {
        return done(new Error('Valid for relationship filter invalid'));
      }

      if (filter.attributes) {
        conditions = Object.assign(conditions, filter.attributes);
      }

      compiledQueryConditions(req, conditions, Model, 'get', done);
    };

    var executeQuery = (conditions, done) => {
      var cursor = req.query.page && req.query.page.cursor ? req.query.page.cursor : null;
      var limit = req.query.page && req.query.page.limit ? req.query.page.limit : 25;
      var query = Model.find(conditions);

      debug('GET %O', conditions);

      if (req.query.sort) {
        query.sort(req.query.sort.replace(',', ' '));
      } else {
        if (Model.jsonapi.sort) {
          query.sort(Model.jsonapi.sort);
        } else {
          query.sort({ createdAt: -1 });
        }
      }

      if (cursor) {
        query.where('_id').lt(cursor);
      }

      query.limit(limit);
      query.exec(done);
    };

    async.waterfall([compileConditions, executeQuery], function(error, documents) {
      if (error) {
        logger.error('Resource router failed to query for objects', { model: Model.modelName, error: error.message });
        sendError(res, error, 400);
      } else {
        sendDocuments(res, documents);
      }
    });
  });
};
