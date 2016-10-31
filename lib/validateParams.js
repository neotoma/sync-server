module.exports = function(tests) {
  tests.forEach(function(test) {
    if (test.required && typeof test.variable === 'undefined') {
      throw new Error('Parameter ' + test.name + ' undefined or null');
    }

    if (test.requiredProperties) {
      test.requiredProperties.forEach(function(property) {
        if (typeof test.variable[property] === 'undefined') {
          throw new Error('Parameter ' + test.name + ' has no ' + property + ' property');
        }
      });
    }

    if (test.requiredType && typeof test.variable !== test.requiredType) {
      throw new Error('Parameter ' + test.name + ' is not a ' + test.requiredType);
    }
  });
}