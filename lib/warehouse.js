/**
 * Serves mock data for tests
 * @module
 */

var _ = require('lodash');
var async = require('async');
var debug = require('debug')('syncServer:warehouse');
var itemController = require('../controllers/item');
var modelFixtures = require('../fixtures/models');
var models = require('../models');
var ObjectId = require('mongoose').Types.ObjectId;
var templateCompiler = require('es6-template-strings');
var validateParams = require('./validateParams');

debug('models', models);

module.exports = {
  bytes: 1234,
  jpegData: Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
  jpegPath: '/foo.jpg',
  jpegUrl: 'http://example.com/foo.jpg',
  jsonPath: '/foo.json',
  jsonUrl: 'http://example.com/foo.json',

  jsonData: function() {
    return { foo1: 'bar1', foo2: 'bar2' };
  },

  pagination: () => {
    return { offset: 0 }
  },

  /**
   * Returns mock item relationships object
   * @returns {Object} Relationships object
   */
  itemRelationships: function() {
    return {
      user: this.one('user'),
      storage: this.one('storage'),
      source: this.one('source'),
      contentType: this.one('contentType')
    };
  },

  /**
   * Returns mock item data object corresponding to given contentType
   * @param {Object} contentType - ContentType
   * @returns {Object} Item data object
   */
  itemDataObject: function(contentType) {
    return this.itemDataObjects(contentType, 1)[0];
  },

  /**
   * Returns collection of mock item data objects corresponding to given contentType
   * @param {Object} [contentType] - ContentType
   * @param {string} [count=234] - Total number of itemDataObjects to return
   * @returns {Object[]} Item data objects
   */
  itemDataObjects: function(contentType, count) {
    contentType = contentType ? contentType : this.one('contentType');
    count = count ? count : 234;

    return itemDataObjects = this.many('item', {
      contentType: contentType.id
    }, count).map((item) => {
      var itemDataObject = {
        id: item.sourceItem,
        type: contentType.pluralCamelName()
      };

      Object.assign(itemDataObject, this.jsonData());

      return itemDataObject;
    });
  },

  /**
   * Returns mock item page object corresponding to given contentType, source and userSourceAuth, if provided
   * @param {Object} [source] - Source
   * @param {Object} [contentType] - ContentType
   * @param {Object} [userSourceAuth] - UserSourceAuth
   * @param {Object} overwriteProperties - Properties that should overwrite standard item page object properties (optional)
   * @returns {Object[]} Item page object
   */
  itemPage: function(source, contentType, userSourceAuth, overwriteProperties) {
    if (!source) {
      var source = this.one('source');
    }

    if (!contentType) {
      var contentType = this.one('contentType');
    }

    if (!userSourceAuth) {
      var userSourceAuth = this.one('userSourceAuth');
    }

    return Object.assign(this.itemPages(source, contentType, userSourceAuth, 1)[0], overwriteProperties);
  },

  /**
   * Returns mock item page objects corresponding to given contentType and source
   * @param {Object} source - Source
   * @param {Object} contentType - ContentType
   * @param {string} [count=234] - Total number of itemDataObjects to return across pages
   * @returns {Object[]} Item page objects
   */
  itemPages: function(source, contentType, userSourceAuth, count) {
    debug('itemPages source\n\n%O\n\n', source);

    validateParams([{
      name: 'contentType', variable: contentType, required: true
    }, {
      name: 'source', variable: source, required: true
    }]);

    var itemDataObjects = this.itemDataObjects(contentType, count);
    var pages = [];
    var totalItemDataObjects = itemDataObjects.length;
    var totalPages = Math.ceil(itemDataObjects.length / source.itemsLimit);

    for (var i = 0; i < totalPages; i++) {
      var pageItemDataObjects = [];
      pages[i] = {};

      // Populate page itemDataObjects
      _.set(pages[i], source.itemDataObjectsFromPagePath(contentType), []);
      itemDataObjects.splice(0, source.itemsLimit).forEach((itemDataObject) => {
        pageItemDataObjects.push(itemDataObject);
      });
      _.set(pages[i], source.itemDataObjectsFromPagePath(contentType), pageItemDataObjects)

      // Populate page total items available
      _.set(pages[i], source.totalItemsAvailableFromPagePath(contentType), totalItemDataObjects);
      
      // Populate page pagination
      if (itemDataObjects.length) {
        _.set(pages[i], 'links.next', itemController.itemsGetUrl(source, contentType, userSourceAuth, { offset: (i * source.itemsLimit) + pageItemDataObjects.length }));
      }
    }

    return pages;
  },

  /**
   * Returns object of mock properties corresponding to given model ID
   * @param {string} modelId - Model ID
   * @param {Object} overwriteProperties - Properties that should overwrite standard mock properties (optional)
   * @returns {Object} Mongoose document properties
   */
  mockProperties: function(modelId, overwriteProperties) {
    var properties = Object.assign({}, modelFixtures[modelId].mockProperties());

    if (overwriteProperties) {
      return Object.assign(properties, overwriteProperties);
    } else {
      return properties;
    }
  },

  /**
   * Returns collection of mock documents corresponding to given model ID
   * @param {string} modelId - Model ID
   * @param {Object} [overwriteProperties] - Properties that should overwrite standard mock properties
   * @param {string} [count=10] - Total number of documents to return
   * @returns {Object[]} Mongoose documents
   */
  many: function(modelId, overwriteProperties, count) {
    var documents = [];
    count = count ? count : 10;

    for (var i = 0; i < count; i++) {
      documents.push(this.one(modelId, overwriteProperties));
    }

    return documents;
  },

  /**
   * Callbacks collection of saved mock documents corresponding to given model ID
   * @param {string} modelId - Model ID
   * @param {Object} [overwriteProperties] - Properties that should overwrite standard mock properties
   * @param {string} [count=15] - Total number of documents to return
   * @param {function} done - Error-first callback function expecting no other parameters
   */
  manySaved: function(modelId, overwriteProperties, count, done) {
    var documents = this.many(modelId, overwriteProperties, count);

    var save = (document, done) => {
      document.save(done);
    }

    async.each(documents, save, (error) => {
      done(error, documents);
    });
  },

  /**
   * Returns one mock document corresponding to given model ID
   * @param {string} modelId - Model ID
   * @param {Object} [overwriteProperties] - Properties that should overwrite standard mock properties. Treated as simply an _id property value if valid ObjectId.
   * @returns {Object} Mongoose document
   */
  one: function(modelId, overwriteProperties) {
    if (ObjectId.isValid(overwriteProperties)) {
      overwriteProperties = {
        _id : overwriteProperties
      }
    }

    var Model = models[modelId];
    var properties = Object.assign(this.mockProperties(modelId), overwriteProperties);

    debug('one %s, %O', modelId, properties, Model);
    
    return new Model(properties);
  },

  /**
   * Callbacks one saved mock document corresponding to given model ID
   * @param {string} modelId - Model ID
   * @param {Object} [overwriteProperties] - Properties that should overwrite standard mock properties
   * @param {function} done - Error-first callback function expecting no other parameters
   */
  oneSaved: function(modelId, overwriteProperties, done) {
    var document = this.one(modelId, overwriteProperties);

    document.save((error) => {
      done(error, document);
    });
  }
};