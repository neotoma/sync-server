var config = require('../config');
var assert = require('assert');
var request = require('supertest');
var app = require('../../app');

describe('GET /', function() {
  it('responds with 404', function(done) {
    request(app).get('/').expect(404).end(function(error, res) {
      done(error);
    });
  });
});