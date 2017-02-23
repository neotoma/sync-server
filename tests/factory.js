/**
 * Factory to create model documents for tests
 * @module
 */

var async = require('async');
var logger = require('../lib/logger');
var modelFixtures = require('../fixtures/models');
var models = require('../models');

module.exports = function(modelId) {
  var fixture = modelFixtures[modelId];

  if (!fixture) {
    throw new Error(`Unable to load fixture for ${modelId}`);
  }

  var mockProperties = fixture.mockProperties();

  return {
    create: function(properties, done) {
      // Shift all parameters forward if callback function for "done" provided as first parameter
      if (typeof properties === 'function') {
        done = properties;
        properties = undefined;
      }

      if (!done) {
        throw new Error('No done parameter provided');
      }

      if (properties) {
        properties = Object.assign({}, mockProperties, properties);
      } else if (properties !== null) {
        properties = mockProperties;
      }

      logger.trace('Factory creating mock model document', { modelId: modelId, properties: properties });

      try {
        var document = new models[modelId](properties);

        if (document.save) {
          document.save(function(error) {
            done(error, document);
          });
        } else {
          done(null, document);
        }
      } catch (error) {
        done(error);
      }
    },

    createMany: function(count, done) {
      if (!count) {
        return done(new Error('No count value provided'));
      }

      if (!done) {
        throw new Error('No done parameter provided');
      }

      logger.trace('Factory creating mock model documents', { modelId: modelId, count: count });

      var create = (count, next) => {
        this.create(next, undefined, count);
      };

      async.times(count, create, function(error, object) {
        done(error, object);
      });
    }
  }
};