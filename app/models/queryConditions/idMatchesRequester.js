/**
 * Returns query conditions that match _id attribute to requester user ID
 * @param {Object} req - Express request object
 * @param {callback} done
 */
module.exports = function(req, done) {
  done(undefined, { _id: req.user.id });
};
