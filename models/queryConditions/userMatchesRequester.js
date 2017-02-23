var debug = require('debug')('syncServer:userMatchesRequester');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * Return query conditions that match user attribute to requester user ID
 * @param {Object} req - Express request object
 * @returns {Object} Query conditions
 */
module.exports = function(req) {
  debug('req.user %s', ObjectId(req.user.id));
  return { user: ObjectId(req.user.id) };
};