var sinon = require('sinon');

module.exports = function(app) {
  return function() {
    if (app.emit.restore) {
      app.emit.restore();
    }

    sinon.spy(app, 'emit');
  };
};