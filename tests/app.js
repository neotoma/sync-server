require('../lib/env')('test');
var app = require('../app');
var assert = require('assert');

describe('app', function() {
  it('has requireAdminAuthentication method', function() {
    assert(typeof app.requireAdminAuthentication === 'function');
  });
  
  it('has requireAthentication method', function() {
    assert(typeof app.requireAuthentication === 'function');
  });

  it('has host', function() {
    assert(typeof app.host === 'string');
  });
});