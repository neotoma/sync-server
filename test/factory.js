var async = require('async');

module.exports = function(modelName, attributes) {
  var Model = require('../models/' + modelName);
  var wh = require('./warehouse/' + modelName);
  var factory = {};

  factory.create = function(done, attributes, n) {
    if (!done) {
      throw new Error('No done parameter provided');
    }

    n = (typeof n !== 'undefined') ? n : '';

    if (attributes) {
      attributes = Object.assign(wh.attributes, attributes);
    } else if (attributes !== null) {
      attributes = wh.attributes;
    }

    Object.keys(attributes).forEach(function(key) {
      if (typeof attributes[key] === 'string') {
        attributes[key] = attributes[key] + n;
      }
    });

    try {
      var object = new Model(attributes);

      if (object.save) {
        object.save(function(error) {
          done(error, object);
        });
      } else {
        done(null, object);
      }
    } catch (error) {
      done(error);
    }
  };

  factory.createMany = function(n, done) {
    var self = this;

    if (!done) {
      throw new Error('No done parameter provided');
    }

    if (!n) {
      return done(new Error('No n value provided'));
    }

    var create = function(n, next) {
      self.create(next, undefined, n);
    };

    async.times(n, create, function(error, object) {
      done(error, object);
    });
  }

  return factory;
};