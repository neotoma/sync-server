module.exports = function(modelName, attributes) {
  var Model = require('../../models/' + modelName);

  return {
    attributes: attributes,
    one: function() {
      return new Model(attributes);
    }
  };
};