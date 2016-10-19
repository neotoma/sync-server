var async = require('async');

module.exports = function(Model, defaultAttributes) {
  var factory = {};

  factory.createOne = function(done, attributes, n) {
    if (!done) {
      throw new Error('No done parameter provided');
    }

    n = (typeof n !== 'undefined') ? n : '';

    if (typeof attributes === 'undefined') {
      attributes = defaultAttributes;
      
      Object.keys(attributes).forEach(function(key) {
        if (typeof attributes[key] === 'string') {
          attributes[key] = attributes[key] + n;
        }
      });
    }

    try {
      done(null, new Model(attributes));
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

    var createOne = function(n, next) {
      self.createOne(next, undefined, n);
    };

    async.times(n, createOne, function(error, object) {
      done(error, object);
    });
  }

  return factory;
};