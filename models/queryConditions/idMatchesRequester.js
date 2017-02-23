var debug = require('debug')('syncServer:idMatchesRequester');

/**
 * Return query conditions that match _id attribute to requester user ID
 * @param {Object} req - Express request object
 * @returns {Object} Query conditions
 */
module.exports = function(req) {
  var conditions = { _id: req.user.id };
  debug('conditions', conditions);
  return conditions;
};