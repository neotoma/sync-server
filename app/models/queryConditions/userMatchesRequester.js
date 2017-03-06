var debug = require('debug')('syncServer:userMatchesRequester');
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * Callbacks query conditions that match user attribute to requester user ID
 * @param {Object} req - Express request object
 * @param {callback} done
 */
module.exports = function(req, done) {
  done(undefined, { user: ObjectId(req.user.id) });
};