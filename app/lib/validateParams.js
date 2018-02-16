var async = require('async');

module.exports = function(tests, done) {
  var runTest = function(test, done) {
    try {
      if (test.required && !test.variable) {
        throw new Error('Parameter ' + test.name + ' undefined or null');
      }

      if (test.variable) {
        if (test.requiredType) {
          if (typeof test.requiredType === 'string' && typeof test.variable !== test.requiredType) {
            throw new Error('Parameter ' + test.name + ' is not a ' + test.requiredType);
          } else if (typeof test.requiredType === 'object' && test.requiredType.indexOf(typeof test.variable) === -1) {
            throw new Error('Parameter ' + test.name + ' is not one of the supported types: ' + test.requiredType.join(', '));
          }
        }

        if (test.regex && !test.regex.test(test.variable)) {
          throw new Error('Parameter ' + test.name + ' is not a properly formatted string');
        }

        if (test.requiredProperties) {
          test.requiredProperties.forEach(function(property) {
            if (typeof property === 'string' && !test.variable[property]) {
              throw new Error('Parameter ' + test.name + ' has no ' + property + ' property');
            } else if (typeof property === 'object') {
              if (typeof test.variable[property.name] === 'undefined') {
                throw new Error('Parameter ' + test.name + ' has no ' + property.name + ' property');
              } else if (property.type && typeof test.variable[property.name] !== property.type) {
                throw new Error('Property ' + property.name + ' of parameter ' + test.name + ' is not ' + property.type);
              }
            }
          });
        }
      }
    } catch (error) {
      if (typeof done === 'function') {
        return done(error);
      } else {
        throw error;
      }
    }

    if (typeof done === 'function') {
      done();
    }
  };

  if (typeof done === 'function') {
    async.each(tests, runTest, done);
  } else {
    tests.forEach(runTest);
  }
};
