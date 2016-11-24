var db = require('../../db');
var async = require('async');
var assert = require('assert');
var request = require('supertest');
var sinon = require('sinon');
var mailer = require('../../../lib/mailer');
var app = require('../../../app');
var ContactVerificationRequest = require('../../../models/contactVerificationRequest');

describe('POST /contactVerificationRequests', function() {
  beforeEach(db.clear);

  it('responds with 400 if data missing', function(done) {
    request(app).post('/contactVerificationRequests').expect(400).end(done);
  });

  it('responds with 400 if data.attributes missing', function(done) {
    var body = {
      'data': {}
    };

    request(app).post('/contactVerificationRequests').send(body).expect(400).end(done);
  });

  it('responds with 400 if method attribute missing', function(done) {
    var body = {
      'data': {
        'attributes': {
          'contact': 'example@example.com',
          'clientOrigin': 'http://example.com'
        }
      }
    };

    request(app).post('/contactVerificationRequests').send(body).expect(400).end(function(error, res) {
      var errors = JSON.parse(res.text);
      assert.equal(errors[0], 'Required method value missing');
      done(error);
    });
  });

  it('responds with 400 if contact attribute missing', function(done) {
    var body = {
      'data': {
        'attributes': {
          'method': 'email',
          'clientOrigin': 'http://example.com'
        }
      }
    };

    request(app).post('/contactVerificationRequests').send(body).expect(400).end(function(error, res) {
      var errors = JSON.parse(res.text);
      assert.equal(errors[0], 'Required contact value missing');
      done(error);
    });
  });

  it('responds with 400 if contact attribute invalid', function(done) {
    var body = {
      'data': {
        'attributes': {
          'method': 'email',
          'contact': 'example',
          'clientOrigin': 'http://example.com'
        }
      }
    };

    request(app).post('/contactVerificationRequests').send(body).expect(400).end(function(error, res) {
      var errors = JSON.parse(res.text);
      assert.equal(errors[0], 'Invalid contact value');
      done(error);
    });
  });

  it('responds with 400 if clientOrigin attribute missing', function(done) {
    var body = {
      'data': {
        'attributes': {
          'contact': 'example@example.com',
          'method': 'email'
        }
      }
    };

    request(app).post('/contactVerificationRequests').send(body).expect(400).end(function(error, res) {
      var errors = JSON.parse(res.text);
      assert.equal(errors[0], 'Required clientOrigin value missing');
      done(error);
    });
  });

  it('creates and processes new contactVerificationRequest if minimum valid data provided', function(done) {
    sinon.spy(mailer, 'sendMail');

    var body = {
      'data': {
        'attributes': {
          'method': 'email',
          'contact': 'example@example.com',
          'clientOrigin': 'http://example.com'
        }
      }
    };

    request(app).post('/contactVerificationRequests').send(body).expect(201).end(function(error, res) {
      if (error) {
        return done(error);
      }

      var attributes = JSON.parse(res.text);
      assert.equal(typeof attributes.id, 'string');

      var testCodeCreation = function(done) {
        ContactVerificationRequest.findById(attributes.id, function(error, contactVerificationRequest) {
          assert.equal(typeof contactVerificationRequest.code, 'string');
          done(error);
        });
      };

      var testMailDelivery = function(done) {
        assert(mailer.sendMail.firstCall.calledWith(sinon.match({
          to: 'example@example.com'
        })));
        done();
      }

      async.series([testCodeCreation, testMailDelivery], function(error, results) {
        done(error);
      });
    });
  });
});