var db = require('../../db');
var async = require('async');
var assert = require('assert');
var request = require('supertest');
var sinon = require('sinon');
var mailer = require('../../../lib/mailer');
var mongoose = require('../../../lib/mongoose');
var app = require('../../../app');
var ContactVerificationRequest = require('../../../models/contactVerificationRequest');
var User = require('../../../models/user');
var NotificationRequest = require('../../../models/notificationRequest');

var testPut = function(attributes, done) {
  ContactVerificationRequest.create(attributes, function(error, contactVerificationRequest) {
    var body = {
      data: {
        id: contactVerificationRequest._id,
        attributes: {
          code: contactVerificationRequest.code,
          verified: true
        }
      }
    };

    var agent = request.agent(app);

    agent.put('/contactVerificationRequests/' + contactVerificationRequest.id).send(body).expect(200).end(function(error, res) {
      if (error) {
        return done(error);
      }

      ContactVerificationRequest.findById(contactVerificationRequest.id, function(error, contactVerificationRequest) {
        var testVerifiedAttribute = function(done) {
          assert(contactVerificationRequest.verified);
          done();
        };

        var testNewUser = function(done) {
          if (attributes.createUser) {
            assert(contactVerificationRequest.userId);

            User.findById(contactVerificationRequest.userId, function(error, user) {
              assert(user);
              done(error, user);
            });
          } else if (attributes.authenticateSession) {
            User.find({
              email: contactVerificationRequest.contact
            }, function(error, users) {
              assert.equal(users.length, 1);
              done(error, users[0]);
            });
          } else {
            assert(typeof contactVerificationRequest.userId === 'undefined');
            done(error, null);
          }
        };

        var testSessionAuthentication = function(user, done) {
          agent.get('/sessions').expect(200).end(function(error, res) {
            var data = JSON.parse(res.text);

            if (attributes.authenticateSession) {
              assert(data.sessions[0].users[0]);
              assert.equal(data.sessions[0].users[0], user._id);
              done(error, user);
            } else {
              var noUser = (typeof data.sessions[0].users === 'undefined' || typeof data.sessions[0].users[0] === 'undefined');
              assert(noUser);
              done(error, user);
            }
          });
        };

        var testNewNotificationRequests = function(user, done) {
          if (attributes.createUser || attributes.authenticateSession) {
            NotificationRequest.find({
              userId: user._id
            }, function(error, notificationRequests) {
              if (attributes.createNotificationRequests) {
                assert.equal(notificationRequests.length, attributes.createNotificationRequests.length);
              } else {
                assert.equal(notificationRequests.length, 0);
              }

              done(error);
            });
          } else {
            done();
          }
        };

        async.waterfall([
          testVerifiedAttribute,
          testNewUser,
          testSessionAuthentication,
          testNewNotificationRequests
        ], function(error) {
          done(error);
        });
      });
    });
  });
};

describe('PUT /contactVerificationRequests/:id', function() {
  beforeEach(db.clear);
  
  it('processes verification properly for contactVerificationRequest with createUser, authenticateSession and createNotificationRequests', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789',
      'createUser': true,
      'authenticateSession': true,
      'createNotificationRequests': [{
        event: 'Test1'
      }, {
        event: 'Test2'
      }]
    };

    testPut(attributes, done);
  });

  it('processes verification properly for contactVerificationRequest with createUser and authenticateSession', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789',
      'createUser': true,
      'authenticateSession': true
    };

    testPut(attributes, done);
  });

  it('processes verification properly for contactVerificationRequest with createUser', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789',
      'createUser': true
    };

    testPut(attributes, done);
  });

  it('processes verification properly for contactVerificationRequest with authenticateSession', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789',
      'authenticateSession': true
    };

    User.create({
      email: attributes.contact
    }, function(error, user) {
      testPut(attributes, done);
    });
  });

  it('throws 500 error properly for contactVerificationRequest with authenticateSession and no preexisting user with email', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789',
      'authenticateSession': true
    };

    ContactVerificationRequest.create(attributes, function(error, contactVerificationRequest) {
      var body = {
        data: {
          id: contactVerificationRequest._id,
          attributes: {
            code: contactVerificationRequest.code,
            verified: true
          }
        }
      };

      request(app).put('/contactVerificationRequests/' + contactVerificationRequest.id).send(body).expect(500).end(function(error, res) {
        assert.equal(res.text, 'Unable to find user after verifying contact');
        done(error);
      });
    });
  });

  it('processes verification properly for minimal contactVerificationRequest', function(done) {
    var attributes = {
      'method': 'email',
      'contact': 'example@example.com',
      'clientOrigin': 'http://example.com',
      'code': '123456789'
    };

    testPut(attributes, done);
  });
});