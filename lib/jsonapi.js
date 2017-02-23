/**
 * Generates routes conformant to the JSON API specification for Mongoose models
 * @module
 */

var _ = require('lodash');
var async = require('async');
var bodyParser = require('body-parser');
var debug = require('debug')('syncServer:jsonapi');
var models = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;
var validateParams = require('./validateParams');

module.exports = {
  addRelationshipsToDocument: function(document, relationships, done) {
    var validate = function(done) {
      validateParams([{
        name: 'document', variable: document, required: true, requiredType: ['object', 'constructor']
      }, {
        name: 'relationships', variable: relationships, required: true, requiredType: ['object']
      }, {
        name: 'done', variable: done, required: true, requiredType: ['function']
      }], done);
    };

    var addRelationshipsToDocument = function(done) {
      var Model = models[document.modelId()];
      
      async.forEachOf(relationships, function(relationship, relationshipName, done) {
        var validateRelationship = function(done) {
          var errors = [];

          if (!relationship.data) {
            errors.push(new Error(`Relationship "${relationshipName}" does not have data property`));
          }

          if (!Model.schema.tree[relationshipName]) {
            errors.push(new Error(`Relationship name "${relationshipName}" is not valid`));
          } else if (Array.isArray(Model.schema.tree[relationshipName]) && !Model.schema.tree[relationshipName][0].ref) {
            errors.push(new Error(`Relationship name "${relationshipName}"is not valid`));
          } else if (!Array.isArray(Model.schema.tree[relationshipName]) && (typeof Model.schema.tree[relationshipName] !== 'object' || !Model.schema.tree[relationshipName].ref)) {
            errors.push(new Error(`Relationship name "${relationshipName}"is not valid`));
          }

          if (Array.isArray(Model.schema.tree[relationshipName]) && !Array.isArray(relationship.data)) {
            errors.push(new Error(`Relationship data should not be an array given name "${relationshipName}"`));
          }

          if (!Array.isArray(relationship.data) && Array.isArray(Model.schema.tree[relationshipName])) {
            errors.push(new Error(`Relationship data should be an array given name "${relationshipName}"`));
          }

          if (errors.length > 0) {
            var error = new Error(`Relationship "${relationshipName}" is not properly formatted`);
            error.errors = errors;
          }

          done(error);
        };

        var addRelationshipToDocument = function(done) {
          var validateAndAddResourceIdentifierObjectRelationship = function(resourceObject, done) {
            var validateResourceIdentifierObject = function(done) {
              var errors = [];

              if (!resourceObject.id) {
                errors.push(new Error(`Relationship resource identifier object for "${relationshipName}" does not have id property`));
              }

              if (!resourceObject.type) {
                errors.push(new Error(`Relationship resource identifier object for "${relationshipName}" does not have type property`));
              }

              if (Array.isArray(Model.schema.tree[relationshipName])) {
                var ref = Model.schema.tree[relationshipName][0].ref;
              } else {
                var ref = Model.schema.tree[relationshipName].ref;
              }

              if (models[_.lowerFirst(ref)].modelType() !== resourceObject.type) {
                errors.push(new Error(`Relationship resource identifier object type "${resourceObject.type}" is not valid`));
              }

              if (!ObjectId.isValid(resourceObject.id)) {
                errors.push(new Error(`Relationship resource identifier object ID "${resourceObject.id}" is not valid`));
              }

              if (errors.length > 0) {
                var error = new Error(`Relationship resource identifier object is not properly formatted`);
                error.errors = errors;
              }

              done(error);
            };

            var addResourceIdentifierToDocument = function(done) {
              if (Array.isArray(Model.schema.tree[relationshipName]) && document[relationshipName].indexOf(resourceObject.id) === -1) {
                document[relationshipName].push(resourceObject.id);
              } else if (!Array.isArray(Model.schema.tree[relationshipName])) {
                document[relationshipName] = resourceObject.id;
              }

              done();
            };

            async.series([validateResourceIdentifierObject, addResourceIdentifierToDocument], function(error) {
              done(error, document);
            });
          };

          if (Array.isArray(relationship.data)) {
            async.forEach(relationship.data, validateAndAddResourceIdentifierObjectRelationship, done);
          } else {
            validateAndAddResourceIdentifierObjectRelationship(relationship.data, done);
          }
        };

        async.series([validateRelationship, addRelationshipToDocument], done);
      }, done);
    };

    async.series([validate, addRelationshipsToDocument], function(error) {
      done(error, document);
    });
  },

  /**
   * Returns a model's query conditions given request user status
   * @param {Object} req - Express request object
   * @param {Object} model - Mongoose model
   * @param {string} method - HTTP method (optional)
   * @returns {Object} Query conditions
   */
  modelQueryConditions: function(req, model, method) {
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
          return queryConditions.public;
        } else if (req.user && req.user.admin && queryConditions.admin) {
          return queryConditions.admin;
        } else if (req.user && !req.user.admin && queryConditions.user) {
          return queryConditions.user;
        }
      } else {
        return queryConditions;
      }
    }

    return {};
  },

  /**
   * Returns query conditions parsed from a variety of variable types
   * They can be interpreted as string, function or conditions object
   * If function, it must take "req" (Express request object) as only parameter and return valid conditions object
   * If object, it must be valid conditions object matching model attributes
   * @param {Object} req - Express request object
   * @param {Object} conditions - Primary query conditions
   * @returns {Object} Parsed query conditions
   */
  parsedQueryConditions: function(req, conditions) {
    if (typeof conditions === 'function') {
      return conditions(req);
    } else if (typeof conditions === 'object') {
      return conditions;
    }
  },

  /**
   * Returns parsed query conditions for model
   * @param {Object} req - Express request object
   * @param {Object} model - Mongoose model
   * @param {string} method - HTTP method (optional)
   * @returns {Object} Parsed model query conditions
   */
  parsedModelQueryConditions: function(req, model, method) {
    var conditions = this.parsedQueryConditions(req, this.modelQueryConditions(req, model, method));
    debug('parsedModelQueryConditions %s, %s: %O', model.modelId(), method, conditions);
    return conditions;
  },

  /**
   * Returns Mongoose query conditions compiled from two separate conditions
   * Primary conditions are passed as parameter "conditions"
   * Secondary conditions are determined from model using route name
   * @param {Object} req - Express request object
   * @param {Object} conditions - Primary query conditions
   * @param {Object} model - Mongoose model (optional)
   * @param {string} method - HTTP method (optional)
   * @returns {Object} Compiled query conditions
   */
  compiledQueryConditions: function myself(req, conditions, model, method) {
    debug('compiledQueryConditions %O, %s, %s', conditions, model.modelId(), method);
    return Object.assign(this.parsedModelQueryConditions(req, model, method), conditions);
  },

  /**
   * Callbacks error with array of validation errors if query data do not conform to model's value restrictions given requester's status (e.g. public, user, admin)
   * @param {Object} req - Express request object
   * @param {Object} data - Query data
   * @param {Object} model - Mongoose model (optional)
   * @param {string} method - HTTP method (optional)
   * @param {function} done - Error-first callback function expecting no other parameters
   */
  validateQueryData: function(req, data, model, method, done) {
    var errors = [];
    var modelConditions = this.parsedModelQueryConditions(req, model, method);
    var valid = true;

    debug('validateQueryData modelConditions %o, data %o', modelConditions, data);

    Object.keys(modelConditions).forEach(function(key) {
      try {
        var dataObjectId = ObjectId(_.get(data, `relationships.${key}.data.id`));
        debug('_.get vs. condition: %s vs. %s', dataObjectId, modelConditions[key], isEqualObjectId);
        var isEqualObjectId = ObjectId(_.get(data, `relationships.${key}.data.id`)).equals(modelConditions[key]);
      } catch (error) {
        var isEqualObjectId = false;
      }

      if (modelConditions[key] !== data.attributes[key] && !isEqualObjectId) {
        errors.push(new Error('Value for attribute "' + key + '" invalid'));
      }
    });

    if (errors.length > 0) {
      debug('validateQueryData errors %O', errors);
      var error = new Error('Query data invalid');
      error.errors = errors;
      return done(error);
    }

    done();
  },

  /**
   * Returns allowed requester type value for model and method
   * @param {Object} model - Mongoose model
   * @param {string} method - HTTP method
   * @returns {string} allowed value (e.g. "public", "user", or "admin)
   */
  allowed: function(model, method) {
    if (typeof model.jsonapi[method] === 'string') {
      return model.jsonapi[method];
    } else if (typeof model.jsonapi[method] === 'object') {
      return model.jsonapi[method].allowed;
    }
  },

  /**
   * Validates request URL against Mongoose needs
   */
  validateRequestUrl: function(req, res, next) {
    if (req.params.id && !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      res.sendError(new Error('Resource ID indicated with invalid format in URL'), 400);
    } else {
      next();
    }
  },

  /**
   * Returns Express route middleware that validates request body against JSON API specification and URL for optional model
   * @param {Object} model - Mongoose model (optional)
   */
  validateRequestBody: function(model) {
    return function(req, res, next) {
      var errors = [];

      if (typeof req.body.data === 'undefined') {
        errors.push(new Error('Data value not provided top-level in body of request'));
      } else {
        if (typeof req.body.data.attributes === 'undefined') {
          errors.push(new Error('Attributes value not provided within data value of request'));
        }

        if (typeof req.body.data.type === 'undefined') {
          errors.push(new Error('Type value not provided within data value of request'));
        } else if (model && req.body.data.type !== model.modelType()) {
          errors.push(new Error('Type value provided within data value of request does not match type indicated by URL'));
        }

        if (req.params.id && req.body.data.id !== req.params.id) {
          errors.push(new Error('ID value provided within data value of request does not match ID indicated by URL'));
        }
      }

      if (errors.length > 0) {
        var error = new Error('Failed to validate request body');
        error.errors = errors;
        res.sendError(error, 400);
      } else {
        next();
      }
    };
  },

  /**
   * Routes requests to resource callback for app, method, path and middleware
   * @param {Object} app - Express app
   * @param {string} method - HTTP method (lowercase, e.g "get")
   * @param {string} path - Path to resource
   * @param {Object} middleware - Dictionary of middleware boolean or function values to use for route
   * @param {function} done - Express route callback expecting req and res as parameters
   */
  routeResource: function(app, method, path, middleware, done) {
    var requireAuthentication = (req, res, next) => {
      if (middleware && middleware.requireAuthentication) {
        app.requireAuthentication(req, res, next);
      } else {
        next();
      }
    };

    var requireAdminAuthentication = (req, res, next) => {
      if (middleware && middleware.requireAdminAuthentication) {
        app.requireAdminAuthentication(req, res, next);
      } else {
        next();
      }
    };

    var validateRequestUrl = (req, res, next) => {
      if (!middleware || middleware.validateRequestUrl !== false) {
        this.validateRequestUrl(req, res, next);
      } else {
        next();
      }
    };

    var validateRequestBody = (req, res, next) => {
      if (middleware && middleware.validateRequestBody && typeof middleware.validateRequestBody === 'function') {
        middleware.validateRequestBody(req, res, next);
      } else if (middleware && middleware.validateRequestBody) {
        this.validateRequestBody()(req, res, next);
      } else {
        next();
      }
    };

    app[method](path, requireAuthentication, requireAdminAuthentication, validateRequestUrl, validateRequestBody, done);
  },

  /**
   * Routes requests to resource callback for app, model, method and path
   * @param {Object} app - Express app
   * @param {model} model - Mongoose model
   * @param {string} method - HTTP method (lowercase, e.g "get")
   * @param {string} path - Path to resource
   * @param {function} done - Express route callback expecting req and res as parameters
   */
  routeModelResource: function(app, model, method, path, done) {
    if (!model.jsonapi || !model.jsonapi[method]) { return; }

    var validateRequestBody = false;

    if (['patch', 'post'].indexOf(method) !== -1) {
      validateRequestBody = this.validateRequestBody(model);
    }

    var middleware = {
      requireAuthentication: (['public'].indexOf(this.allowed(model, method)) === -1),
      requireAdminAuthentication: (['public', 'user'].indexOf(this.allowed(model, method)) === -1),
      validateRequestBody: validateRequestBody
    }

    this.routeResource(app, method, path, middleware, done);
  },

  /**
   * Routes GET requests to resource for collections of resource objects for app and model
   * @param {Object} app - Express app
   * @param {model} model - Mongoose model
   */
  routeModelGetObjectsResource: function(app, model) {
    this.routeModelResource(app, model, 'get', '/' + model.modelType(), (req, res) => {
      var conditions = this.compiledQueryConditions(req, {}, model, 'get');
      var cursor = req.query.page && req.query.page.cursor ? req.query.page.cursor : null;
      var limit = req.query.page && req.query.page.limit ? req.query.page.limit : 25;
      var query = model.find(conditions);
      var supportedSortAttributes = ['_id' , 'createdAt', 'updatedAt'];

      debug('GET %O', conditions);

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
        query.sort({ createdAt: -1 });
      }

      if (cursor) {
        query.where('_id').lt(cursor);
      }

      query.limit(limit);

      query.exec(function(error, documents) {
        if (error) {
          logger.error('Resource router failed to query for objects', { model: model.modelName, error: error.message });
          res.sendError();
        } else {
          res.sendDocuments(documents);
        }
      });
    });
  },

  /**
   * Routes GET requests to resource for individual resource objects for app and model
   * @param {Object} app - Express app
   * @param {model} model - Mongoose model
   */
  routeModelGetObjectResource: function(app, model) {
    this.routeModelResource(app, model, 'get', '/' + model.modelType() + '/:id', (req, res) => {
      var conditions = this.compiledQueryConditions(req, { _id: req.params.id }, model, 'get');

      debug('GET findOne %O', conditions);

      model.findOne(conditions, function(error, document) {
        if (error) {
          logger.error('Resource router failed to query for object', { model: model.modelName, error: error.message });
          res.sendError();
        } else if (!document) {
          res.sendNotFound();
        } else {
          res.sendDocument(document);
        }
      });
    });
  },

  /**
   * Routes POST requests to resource for individual resource objects for app and Model
   * @param {Object} app - Express app
   * @param {Object} Model - Mongoose model
   */
  routeModelPostObjectResource: function(app, Model) {
    this.routeModelResource(app, Model, 'post', '/'+ Model.modelType(), (req, res) => {
      /**
       * Validates all available attributes (TODO: and relationships)
       */
      var validate = (done) => {
        debug('POST validate');
        this.validateQueryData(req, req.body.data, Model, 'post', done);
      };

      /**
       * Creates the document with all available attributes
       */
      var createDocument = (done) => {
        debug('POST createDocument');

        try {
          var document = new Model(req.body.data.attributes);
        } catch (error) {
          return done(error);
        }

        done(undefined, document);
      };

      /**
       * Adds all available relationships to document
       */
      var addRelationships = (document, done) => {
        if (!req.body.data.relationships) {
          return done(undefined, document);
        }

        this.addRelationshipsToDocument(document, req.body.data.relationships, function(error) {
          done(error, document);
        });
      };

      /**
       * Saves the document
       */
      var saveDocument = (document, done) => {
        document.save((error) => {
          done(error, document);
        });
      };

      /**
       * Reloads the document to ensure all autopopulate references are populated
       */
      var reloadDocument = (document, done) => {
        Model.findById(document.id, (error, document) => {
          done(error, document);
        });
      }

      /**
       * Executes any available post-POST routine available for Model
       */
      var executePostRoutine = (document, done) => {
        if (Model.jsonapi.post && Model.jsonapi.post.post) {
          Model.jsonapi.post.post(req, res, document, function(error) {
            done(error, document);
          });
        } else {
          done(undefined, document);
        }
      };

      async.waterfall([
        validate,
        createDocument,
        addRelationships,
        saveDocument,
        reloadDocument,
        executePostRoutine
      ], function(error, document) {
        if (error) {
          if (error.errors) {
            return res.sendError(error, 400);
          }

          return res.sendError(error);
        }

        res.sendDocument(document, 201);
      });
    });
  },

  /**
   * Routes POST requests to resource for individual resource objects for app and Model
   * @param {Object} app - Express app
   * @param {Object} Model - Mongoose model
   */
  routeModelPatchObjectResource: function(app, Model) {
    this.routeModelResource(app, Model, 'patch', '/' + Model.modelType() + '/:id', (req, res) => {
      var validate = (done) => {
        this.validateQueryData(req, req.body.data, Model, 'patch', done);
      };

      var findOneAndUpdate = (done) => {
        Model.findOneAndUpdate(this.compiledQueryConditions(req, { _id: req.params.id }, Model, 'patch'), req.body.data.attributes, { new: true }, done);
      };

      var addRelationships = (document, done) => {
        if (!document) {
          return done(new Error('No document found with ID'));
        }

        if (!req.body.data.relationships) {
          return done(undefined, document);
        }

        this.addRelationshipsToDocument(document, req.body.data.relationships, function(error) {
          done(error, document);
        });
      };

      var saveDocument = (document, done) => {
        document.save((error) => {
          done(error, document);
        });
      };

      var executePostRoutine = (document, done) => {
        if (Model.jsonapi.patch && Model.jsonapi.patch.post) {
          Model.jsonapi.patch.post(req, res, document, function(error, req, res, document) {
            done(error, document);
          });
        } else {
          done(undefined, document);
        }
      };

      async.waterfall([
        validate,
        findOneAndUpdate,
        addRelationships,
        saveDocument,
        executePostRoutine
      ], function(error, document) {
        if (error) {
          if (error.message === 'No document found with ID') {
            res.sendNotFound();
          } else {
            res.sendError(error, 500);
          }
        } else {
          res.sendDocument(document, 200);
        }
      });
    });
  },

  /**
   * Routes DELETE requests to resource for individual resource objects for app and Model
   * @param {Object} app - Express app
   * @param {Object} Model - Mongoose model
   */
  routeModelDeleteObjectResource: function(app, Model) {
    this.routeModelResource(app, Model, 'delete', '/' + Model.modelType() + '/:id', (req, res) => {
      Model.findOne(this.compiledQueryConditions(req, { _id: req.params.id }, Model, 'delete'), function(error, document) {
        if (error) {
          res.sendError(error);
        } else if (!document) {
          res.sendNotFound();
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
  },

  /**
   * Establish middleware that generates routes conformant to the JSON API specification for app and Mongoose models
   * @param {Object} app - Express app
   */
  routeModelResources: function(app) {
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
      };

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

      /**
       * Returns JSON API resource object representing provided Mongoose document
       * @param {Object} document - Mongoose document
       * @returns {Object} object - JSON API resource object
       */
      res.resourceObjectFromDocument = function(document) {
        if (!document) {
          throw new Error('No document provided');
        }

        var attributes = document.toObject();
        delete attributes.id;

        var relationships = {};

        Object.keys(attributes).forEach(function(key) {
          var addRelationship = function(value) {
            if (value && value._id && value.modelType) {
              if (!relationships[key] || !relationships[key].data) {
                if (Array.isArray(document[key])) {
                  relationships[key] = { data: [] };
                } else {
                  relationships[key] = { data: {} };
                }
              }

              if (Array.isArray(document[key])) {
                relationships[key].data.push({
                  id: value._id,
                  type: value.modelType()
                });
              } else {
                relationships[key].data = {
                  id: value._id,
                  type: value.modelType()
                };
              }

              delete attributes[key];
            }
          };

          if (Array.isArray(document[key])) {
            if (document[key].length < 1) {
              delete attributes[key];
            } else {
              document[key].forEach(addRelationship);
            }
          } else {
            addRelationship(document[key]);
          }
        });

        return {
          id: document.id,
          type: document.modelType(),
          attributes: attributes,
          relationships: Object.getOwnPropertyNames(relationships).length > 0 ? relationships : undefined
        };
      };

      /**
       * Returns JSON API resource identifier object representing provided Mongoose document
       * @param {Object} document - Mongoose document
       * @returns {Object} object - JSON API relationship object
       */
      res.resourceIdentifierObjectFromDocument = function(document, name) {
        if (!document) {
          throw new Error('No document provided');
        }

        return {
          id: document.id,
          type: document.modelType()
        };
      };

      /**
       * Add document as relationship to JSON API resource object
       * @param {Object} object - JSON API resource object
       * @param {Object} document - Mongoose document
       * @param {string} name - Name of relationship (e.g. "author")
       * @param {string} [type=to-many] - Type of relationship (either "to-many" or "to-one")
       */
      res.addRelationshipToResourceObject = function(object, document, name, type) {
        validateParams([{
          name: 'object', variable: object, required: true, requiredType: 'object'
        }, {
          name: 'document', variable: document, required: true, requiredType: 'object'
        }, {
          name: 'name', variable: name, required: true, requiredType: 'string'
        }, {
          name: 'type', variable: type, requiredType: 'string'
        }]);

        if (!object.relationships) {
          object.relationships = {};
        }

        type = type ? type : 'to-many';

        if (type === 'to-many') {
          if (!Array.isArray(object.relationships[name])) {
            object.relationships[name] = [];
          }

          object.relationships[name].push(res.resourceIdentifierObjectFromDocument(document));
        } else if (type === 'to-one') {
          object.relationships[name] = this.resourceIdentifierObjectFromDocument(document);
        } else {
          throw new Error('Type parameter is not valid');
        }
      };

      /**
       * Sends response document with principal data, included resources or errors
       * @param {Object} data – Principal data (optional)
       * @param {Object} included – Included resources (optional)
       * @param {Object} errors - Errors (optional)
       * @param {number} [status=200] - HTTP status code
       */
      res.sendResponseDocument = function(data, included, errors, status) {
        var doc = {};

        if (data) {
          doc['data'] = data;

          if (included && (!Array.isArray(included) || included.length > 0)) {
            doc['included'] = included;
          }
        } else if (errors) {
          doc['errors'] = errors;
        }

        doc['jsonapi'] = {
          version: '1.0'
        };

        if (!status) {
          status = 200;
        }

        this.status(status).json(doc);
      };

      /**
       * Sends response document with principal data and included resources
       * @param {Object} data – Principal data
       * @param {Object} included – Included resources (optional)
       */
      res.sendData = function(data, included) {
        if (!data) {
          throw new Error('No data parameter provided');
        }

        this.sendResponseDocument(data, included);
      };

      /**
       * Sends response document with model document
       * @param {Object} document - Model document
       * @param {number} status - HTTP status code
       */
      res.sendDocument = function(document, status) {
        res.sendResponseDocument(this.resourceObjectFromDocument(document), null, null, status);
      };

      /**
       * Sends response document with model documents
       * @param {Object} documents - Array of model documents
       */
      res.sendDocuments = function(documents) {
        var objects = documents.map((document) => {
          return this.resourceObjectFromDocument(document);
        });

        res.sendResponseDocument(objects);
      };

      /**
       * Sends response document with 404 status code
       */
      res.sendNotFound = function() {
        res.sendResponseDocument(null, null, null, 404);
      }

      /**
       * Sends response document with error and status code
       * @param {Error} error - Error object (optional) with optional errors property
       * @param {number} [status=500] - HTTP status code
       */
      res.sendError = function(error, status) {
        if (error) {
          var errors = error.errors;

          if (!errors) {
            errors = new Array(error);
          }

          // Convert object of errors to array if needed
          if(typeof errors === 'object' && !Array.isArray(errors)) {
            errors = Object.keys(errors).map(function(key) {
              return errors[key];
            });
          }

          errors = errors.map(function(error) {
            return {
              title: error.message
            };
          });
        }

        if (!status) {
          status = 500;
        }

        this.sendResponseDocument(null, null, errors, status);
      };

      next();
    });

    /**
     * Establish body-parser middleware with JSON API error handling
     */
    app.use(function(req, res, next) {
      var json = bodyParser.json();

      json(req, res, function(error) {
        if (error) {
          res.sendError(error, 400);
        } else {
          next();
        }
      });
    });

    app.get('/', function(req, res) {
      res.sendResponseDocument();
    });

    // Route requests for each model with Mongoose compatability and jsonapi configuration
    Object.keys(models).forEach((key) => {
      var model = models[key];
      
      if (model.modelName && model.jsonapi) {
        this.routeModelGetObjectsResource(app, model);
        this.routeModelGetObjectResource(app, model);
        this.routeModelPostObjectResource(app, model);
        this.routeModelPatchObjectResource(app, model);
        this.routeModelDeleteObjectResource(app, model);
      }
    });
  }
};