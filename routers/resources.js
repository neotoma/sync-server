var pluralize = require('pluralize');
require('../lib/prototypes/string.js');

const DEFAULT_PAGE_LIMIT = 25;

module.exports = function(app, modelConfigs) {
  var get = function(req, res, model, supportedSortAttributes) {
    var limit = req.query.page && req.query.page.limit ? req.query.page.limit : DEFAULT_PAGE_LIMIT;
    var cursor = req.query.page && req.query.page.cursor ? req.query.page.cursor : null;
    var query = model.find({})

    if (req.query.sort) {
      var sortOrder = 1;
      var sortAttributes = req.query.sort;
      var unsupportedSortAttributeFound = false;

      sortAttributes.split(',').forEach(function(sortAttribute) {
        var absoluteSortAttribute;

        if (sortAttribute.charAt(0) === '-') {
          absoluteSortAttribute = sortAttribute.substring(1);
        } else {
          absoluteSortAttribute = sortAttribute;
        }

        if (supportedSortAttributes.indexOf(absoluteSortAttribute) === -1) {
          unsupportedSortAttributeFound = true;
        }
      });

      if (unsupportedSortAttributeFound) {
        return res.status(400).send('Unsupported sort attribute provided');
      }

      query.sort(sortAttributes.replace(',', ' '));
    } else {
      query.sort({ _id: -1 });
    }

    if (cursor) {
      query.where('_id').lt(cursor);
    }

    query.limit(limit);

    query.exec(function(error, resources) {
      if (error) {
        return res.json({
          error: error
        });
      }

      var json = { }
      json[pluralize(model.modelName.lowercaseFirstLetter())] = resources.map(function(resource) {
        return resource.toObject();
      });

      res.json(json);
    });
  };

  modelConfigs.forEach(function(modelConfig) {
    var adminAuthFilter = function(req, res, next) {
      if (modelConfig.adminAuthFilter) {
        app.adminAuthFilter(req, res, next);
      } else {
        next();
      }
    }

    app.get('/' + pluralize(modelConfig.name), app.authFilter, adminAuthFilter, function(res, req) {
      var supportedSortAttributes = modelConfig.supportedSortAttributes ? modelConfig.supportedSortAttributes : ['_id' , 'createdAt', 'updatedAt'];
      get(res, req, require('../models/' + modelConfig.name), supportedSortAttributes);
    });
  });

  return exports;
};