var assert = require('assert');
var app = require('../app');

describe('app', function() {
  it('has host', function() {
    assert(app.host);
  });
});