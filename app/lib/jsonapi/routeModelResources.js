var bodyParser = require('body-parser'),
  debug = require('app/lib/debug')('app:jsonapi:routeModelResources'),
  sendResponseDocument = require('app/lib/jsonapi/sendResponseDocument'),
  routeModelDeleteObjectResource = require('app/lib/jsonapi/routeModelDeleteObjectResource'),
  routeModelGetObjectResource = require('app/lib/jsonapi/routeModelGetObjectResource'),
  routeModelGetObjectsResource = require('app/lib/jsonapi/routeModelGetObjectsResource'),
  routeModelPatchObjectResource = require('app/lib/jsonapi/routeModelPatchObjectResource'),
  routeModelPostObjectResource = require('app/lib/jsonapi/routeModelPostObjectResource'),
  sendError = require('app/lib/jsonapi/sendError');

/**
 * Establish middleware that generates routes conformant to the JSON API specification for app and Mongoose models
 */
module.exports = function(app) {
  debug('start routeModelResources');

  /**
   * Negotiate the Content-Type and Accept request headers
   * @see {@link http://jsonapi.org/format/#content-negotiation-servers}
   */
  app.use(function(req, res, next) {
    var isModifiedContentType = function(contentType) {
      return (/application\/vnd\.api\+json/.test(contentType) && contentType !== 'application/vnd.api+json');
    };

    if (req.get('Content-Type') && isModifiedContentType(req.get('Content-Type'))) {
      res.sendStatus(415);
      return;
    }

    if (req.get('Accept')) {
      var badAccept = false;
      req.get('Accept').split(';').forEach(function(accept) {
        badAccept = (isModifiedContentType(accept));
      });

      if (badAccept) {
        res.sendStatus(406);
        return;
      }
    }

    next();
  });

  app.use(function(req, res, next) {
    res.set('Content-Type', 'application/vnd.api+json');
    next();
  });

  /**
   * Establish body-parser middleware with JSON API error handling
   */
  app.use((req, res, next) => {
    var json = bodyParser.json({ type: ['application/vnd.api+json', 'application/json'] });

    json(req, res, (error) => {
      if (error) {
        sendError(res, error, 400);
      } else {
        next();
      }
    });
  });

  app.get('/', (req, res) => {
    sendResponseDocument(res);
  });
  
  // eslint-disable-next-line global-require
  let models = require('app/models');

  debug('routing %s models', models.length);

  // Route requests for each model with Mongoose compatability and jsonapi configuration
  Object.keys(models).forEach((key) => {
    var model = models[key];
    
    if (model.modelName && model.jsonapi) {
      routeModelGetObjectsResource(app, model);
      routeModelGetObjectResource(app, model);
      routeModelPostObjectResource(app, model);
      routeModelPatchObjectResource(app, model);
      routeModelDeleteObjectResource(app, model);
    }
  });
};
