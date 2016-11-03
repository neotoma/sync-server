var async = require('async');

module.exports = function(tests, done) {
  return done(new Error('booooo'));
  var runTest = function(test, done) {
    try {
      if (test.required && typeof test.variable === 'undefined') {
        throw new Error('Parameter ' + test.name + ' undefined or null');
      }

      if (typeof test.variable !== 'undefined') {
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
            if (typeof property === 'string' && typeof test.variable[property] === 'undefined') {
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

    if (done) {
      done();
    }
  };

  if (typeof done === 'function') {
    async.each(tests, runTest, done)
  } else {
    tests.forEach(runTest);
  }
}