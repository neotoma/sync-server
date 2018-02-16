var _ = require('app/lib/lodash'),
  async = require('async'),
  modelQueryConditions = require('app/lib/jsonapi/modelQueryConditions'),
  ObjectId = require('mongoose').Types.ObjectId;

/**
 * Callbacks error with array of validation errors if query data do not conform to model's value restrictions given requester's status (e.g. public, user, admin)
 * @param {Object} req - Express request object
 * @param {Object} data - Query data
 * @param {Object} model - Mongoose model (optional)
 * @param {string} method - HTTP method (optional)
 * @param {function} done - Error-first callback function expecting no other parameters
 */
module.exports = function(req, data, model, method, done) {
  var getConditions = (done) => {
    modelQueryConditions(req, model, method, done);
  };

  var validateQueryData = (conditions, done) => {
    var errors = [];

    Object.keys(conditions).forEach(function(key) {
      var isEqualObjectId;
      
      try {
        isEqualObjectId = ObjectId(_.get(data, `relationships.${key}.data.id`)).equals(conditions[key]);
      } catch (error) {
        isEqualObjectId = false;
      }

      if ((Array.isArray(conditions[key]) && conditions[key].indexOf(data.attributes[key]) === -1) || (!Array.isArray(conditions[key]) && conditions[key] !== data.attributes[key] && !isEqualObjectId)) {
        errors.push(new Error(`Value for attribute ${key} invalid`));
      }
    });

    if (errors.length > 0) {
      var error = new Error('Query data invalid');
      error.errors = errors;

      return done(error);
    }

    done();
  };

  async.waterfall([getConditions, validateQueryData], done);
};
