var app = require('app');
var sinon = require('sinon');

module.exports = function() {
  if (app.emit.restore) {
    app.emit.restore();
  }

  sinon.spy(app, 'emit');
};
