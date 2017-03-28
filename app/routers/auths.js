var auth = require('./auth');
var logger = require('app/lib/logger');
var validateParams = require('app/lib/validateParams');

module.exports = function(app, Model) {
  validateParams([{
    name: 'app', variable: app, required: true, requiredProperties: ['host'],
  }, {
    name: 'Model', variable: Model, required: true, requiredProperties: ['modelName', 'modelType']
  }]);

  Model.find({
    clientId: { $ne: null },
    clientSecret: { $ne: null },
    itemStorageEnabled: true,
    passportStrategy: { $ne: null }
  }, (error, documents) => {
    documents.forEach((document) => {
      var log = logger.scopedLog({
        modelName: Model.modelName,
        documentId: document.id
      });

      try {
        auth(app, Model, document);
      } catch (error) {
        log('error', 'Auths router failed to load routes for model', { error: error.message });
        throw error;
      }
    });
  });
};