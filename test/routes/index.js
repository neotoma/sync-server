var db = require('../db');
var request = require('supertest');
var app = require('../../app');

describe('GET /', function() {
  beforeEach(db.clear);

  it('responds with 404', function(done) {
    request(app).get('/').expect(404).end(function(error, res) {
      done(error);
    });
  });
});