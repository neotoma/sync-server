/**
 * Run tests against app module
 * @module
 */

require('park-ranger')();
var app = require('app');
var assert = require('assert');

describe('app', function() {
  it('has requireAdminAuthentication method', function() {
    assert(typeof app.requireAdminAuthentication === 'function');
  });
  
  it('has requireAthentication method', function() {
    assert(typeof app.requireAuthentication === 'function');
  });
});
