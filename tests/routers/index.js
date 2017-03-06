require('dotenvs')('test');
var app = require('app');
var assert = require('assert');
var request = require('supertest');

describe('GET /', function() {
  it('responds with jsonapi object', function(done) {
    request(app).get('/').end(function(error, res) {
      assert(JSON.parse(res.text).jsonapi);
      done();
    });
  });
});

describe('GET /jobs', function() {
  describe('returns job resource objects related to request user', function() {
    it('sorted by createdAt desc by default');
    it('sortable by createdAt asc');
    it('sortable by id asc and desc');
    it('sortable by updatedAt asc and desc');
    it('not sortable by other attribute');
    it('limited to 25 objects per page by default');
    it('limitable by other objects count');
    it('pageable by cursor');
  });

  it('returns no job resource objects related to other users');
  it('returns job resource objects related to request user and other users when request user is admin');
  it('includes jsonapi object');
  it('includes 200 status code');
});