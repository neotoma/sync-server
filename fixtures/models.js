/**
 * Models expected by app and their testable properties
 */

var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
  attribute: {
    name: 'Attribute',
    type: 'attributes',
    jsonapi: {
      get: 'public'
    },
    mockProperties: () => {
      return { 
        _id: 'attributeId',
        value: 'attributeValue'
      };
    },
    schemaProperties: {
      _id: { type: String, required: true },
      value: { type: String, required: true }
    }
  },
  contactVerification: {
    name: 'ContactVerification',
    type: 'contactVerifications',
    jsonapi: {
      delete: 'admin',
      get: 'admin',
      patch: 'admin',
      post: {
        allowed: 'public',
        tests: [{
          document: function(mockProperties, done) {
            // With contactVerification with invalid contactVerificationRequest
            done();
          },
          done: function(res, done) {
            // Verify an error returned in response
            done();
          }
        }, {
          document: function(mockProperties, done) {
            // With contactVerification with invalid contactVerificationRequestCode
            done();
          },
          done: function(res, done) {
            // Verify an error returned in response
            done();
          }
        }, {
          document: function(mockProperties, done) {
            // With contactVerification with user and contactVerificationRequest.authenticateSession
            done();
          },
          done: function(res, done) {
            // Verify a session has been established
            done();
          }
        }, {
          document: function(mockProperties, done) {
            // With contactVerification with user and no contactVerificationRequest.authenticateSession
            done();
          },
          done: function(res, done) {
            // Verify a session has not been established
            done();
          }
        }, {
          document: function(mockProperties, done) {
            // With contactVerification with no user or contactVerificationRequest.authenticateSession
            done();
          },
          done: function(res, done) {
            // Verify a session has not been established
            done();
          }
        }]
      }
    },
    mockProperties: () => {
      var code = 'contactVerificationRequestCode';

      return {
        _id: ObjectId(),
        contactVerificationRequestCode: code,
        contactVerificationRequest: {
          _id: ObjectId(),
          code: code
        },
        session: 'contactVerificationCode',
        user: ObjectId()
      };
    },
    schemaProperties: {
      contactVerificationRequestCode: { type: String, required: true },
      contactVerificationRequest: { ref: 'ContactVerificationRequest', required: true },
      session: String,
      user: { ref: 'User' }
    }
  },
  contactVerificationRequest: {
    name: 'ContactVerificationRequest',
    type: 'contactVerificationRequests',
    jsonapi: {
      delete: 'admin',
      get: 'admin',
      patch: 'admin',
      post: {
        allowed: 'public',
        queryConditions: {
          code: undefined
        }
      }
    },
    mockProperties: () => {
      return {
        _id: ObjectId(),
        authenticateSession: true,
        clientOrigin: 'http://contactVerificationRequest.example.com',
        code: 'contactVerificationRequestCode',
        contact: 'email@example.com',
        createNotificationRequests: [{
          event: 'contactVerificationRequestTest'
        }],
        createUser: true,
        method: 'email'
      };
    },
    schemaProperties: {
      authenticateSession: {  type: Boolean, default: false },
      clientOrigin: { type: String, required: true },
      code: String,
      contact: {
        type: String,
        required: true,
        validate: {
          validValue: 'email@example.com',
          invalidValue: 'a123'
        }
      },
      createNotificationRequests: {
        type: Array,
        validate: {
          validValue: [{
            event1: 'contactVerificationRequestEvent1',
            event2: 'contactVerificationRequestEvent2'
          }],
          invalidValue: {
            foo: 'bar'
          }
        }
      },
      createUser: { type: Boolean, default: false },
      method: {
        type: String,
        required: true,
        validate: {
          validValue: 'email',
          invalidValue: 'tofu'
        }
      }
    }
  },
  contentType: {
    name: 'ContentType',
    type: 'contentTypes',
    jsonapi: {
      delete:  'admin',
      get: 'public',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        name: 'Super Widget'
      };
    },
    schemaProperties: {
      name: { type: String, required: true }
    }
  },
  item: {
    name: 'Item',
    type: 'items',
    jsonapi: {
      delete: 'admin',
      get: 'user',
      patch: 'admin',
      post: 'admin'
    },

    mockProperties: () => {
      return { 
        _id: ObjectId(),
        contentType: ObjectId(),
        source: ObjectId(),
        sourceItem: ObjectId().toString(),
        storage: ObjectId(),
        storageAttemptedAt: new Date(1492, 1, 1, 1, 1, 1, 1),
        storageBytes: 12345,
        storageError: 'Item storage error',
        storageFailedAt: new Date(1492, 1, 1, 1, 3, 1, 1),
        storagePath: '/directory/file.json',
        storageVerifiedAt: new Date(1492, 1, 1, 1, 2, 1, 1),
        user: ObjectId()
      };
    },
    nonConditionProperties: ['data'],
    schemaProperties: {
      contentType: { ref: 'ContentType', required: true },
      source: { ref: 'Source', required: true },
      sourceItem: { type: String, required: true },
      storage: { ref: 'Storage', required: true },
      storageAttemptedAt: Date,
      storageBytes: Number,
      storageError: String,
      storageFailedAt: Date,
      storagePath: String,
      storageVerifiedAt: Date,
      user: { ref: 'User', required: true }
    }
  },
  job: {
    name: 'Job',
    type: 'jobs',
    jsonapi: {
      delete: 'admin',
      get: 'user',
      post: 'user',
      patch: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        name: 'storeAllItemsForUserStorageSource',
        source: ObjectId(),
        storage: ObjectId(),
        user: ObjectId()
      };
    }, 
    schemaProperties: {
      name: {
        type: String,
        required: true,
        validate: {
          validValue: 'storeAllItemsForUserStorageSource',
          invalidValue: 'superduper'
        }
      },
      source: { ref: 'Source' },
      storage: { ref: 'Storage' },
      user: { ref: 'User' },
      totalItemsAvailable: Number,
      totalItemsStored: Number
    }
  },
  notificationRequest: {
    name: 'NotificationRequest',
    type: 'notificationRequests',
    jsonapi: {
      delete: 'user',
      get: 'user',
      patch: 'admin',
      post: 'user'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        event: 'notificationRequestEvent',
        user: ObjectId(),
        source: ObjectId(),
        storage: ObjectId()
      };
    }, 
    schemaProperties: {
      event: { type: String, required: true },
      source: { ref: 'Source' },
      storage: { ref: 'Storage' },
      user: { ref: 'User', required: true }
    }
  },
  source: {
    name: 'Source',
    type: 'sources',
    jsonapi: {
      delete: 'admin',
      get: 'public',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return {
        _id: ObjectId(),
        apiVersion: '99',
        authScope: ['foo','bar'],
        clientId: 'sourceClientId',
        clientSecret: 'sourceClientSecret',
        itemStorageEnabled: true,
        host: 'sourcehost.example.com',
        itemDataObjectsFromPagePathTemplate: 'things.${contentTypePluralCamelName}',
        itemsGetUrlTemplate: 'https://${host}/test-path/${contentTypePluralCamelName}?foo=bar&access_token=${accessToken}&limit=${limit}&offset=${offset}',
        itemsLimit: 72,
        logoGlyphPath: '/source/logoGlyphPath.svg',
        name: 'Super Source',
        totalItemsAvailableFromPagePathTemplate: 'total.${contentTypePluralCamelName}'
      };
    },
    schemaProperties: {
      apiVersion: String,
      authScope: Array,
      clientId: String,
      clientSecret: String,
      contentTypes: [{ ref: 'ContentType' }],
      itemStorageEnabled: { type: Boolean, default: false },
      host: String,
      itemsLimit: { type: Number, default: 25 },
      logoGlyphPath: String,
      name: { type: String, required: true },
      passportStrategy: String,
      itemsGetUrlTemplate: String,
      itemDataObjectsFromPagePathTemplate: { type: String, default: 'data' },
      slug: String,
      totalItemsAvailableFromPagePathTemplate: String
    }
  },
  storage: {
    name: 'Storage',
    type: 'storages',
    jsonapi: {
      delete: 'admin',
      get: 'public',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        clientId: 'storageClientId',
        clientSecret: 'storageClientSecret',
        host: 'storagehost.example.com',
        itemStorageEnabled: true,
        logoGlyphPath: '/images/logos/dropbox-glyph.svg',
        itemPutUrlTemplate: 'https://${host}/test-path${path}?foo=bar&access_token=${accessToken}',
        name: 'storageName',
        passportStrategy: 'passport-mocked'
      };
    },
    schemaProperties: {
      clientId: String,
      clientSecret: String,
      host: String,
      itemStorageEnabled: { type: Boolean, default: false },
      logoGlyphPath: String,
      name: { type: String, required: true },
      passportStrategy: String,
      itemPutUrlTemplate: String,
      slug: String
    }
  },
  user: {
    name: 'User',
    type: 'users',
    jsonapi: {
      delete: 'admin',
      get: 'user',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        admin: false,
        email: 'email@example.com',
        name: 'userName'
      };
    },
    schemaProperties: {
      admin: { type: Boolean, default: false },
      email: { type: String, required: true },
      name: String
    }
  },
  userSourceAuth: {
    name: 'UserSourceAuth',
    type: 'userSourceAuths',
    jsonapi: {
      delete: 'user',
      get: 'user',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        source: ObjectId(),
        sourceUser: 'userSourceAuthSourceUser',
        sourceToken: 'userSourceAuthSourceToken',
        user: ObjectId()
      };
    },
    schemaProperties: {
      source: { ref: 'Source', required: true },
      sourceToken: String,
      sourceUser: String,
      user: { ref: 'User' }
    },
  },
  userStorageAuth: {
    name: 'UserStorageAuth',
    type: 'userStorageAuths',
    jsonapi: {
      delete: 'user',
      get: 'user',
      patch: 'admin',
      post: 'admin'
    },
    mockProperties: () => {
      return { 
        _id: ObjectId(),
        storage: ObjectId(),
        storageUser: 'userStorageAuthStorageUser',
        storageToken: 'userStorageAuthStorageToken',
        user: ObjectId()
      };
    },
    schemaProperties: {
      storage: { ref: 'Storage', required: true },
      storageToken: String,
      storageUser: { type: String, required: true },
      user: { ref: 'User' }
    }
  }
};