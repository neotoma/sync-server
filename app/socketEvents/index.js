module.exports = function(app, socket) {
  return require('./status')(app, socket);
};