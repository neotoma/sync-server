/**
 * Storage model
 * @module
 */

var modelFactory = require('app/factories/model');
var templateCompiler = require('es6-template-strings');
var validateParams = require('app/lib/validateParams');

/**
 * Represents storage of items from sources
 * @class Storage
 * @property {string} [clientId] - OAuth 2.0 client ID
 * @property {string} [clientSecret] - OAuth 2.0 client secret
 * @property {string} [host] - Host URL (e.g. "api-content.dropbox.com")
 * @property {boolean} [itemStorageEnabled=false] - Whether storage is enabled for storing items from sources
 * @property {string} logoGlyphPath - Name (e.g. "Dropbox")
 * @property {string} name - Name (e.g. "Dropbox")
 * @property {string} [passportStrategy] - Strategy for Passport module (e.g. "passport-dropbox-oauth2")
 * @property {string} [itemPutUrlTemplate=https://{$host}{$path}?access_token={$accessToken}] - String template used to generate URLs for PUT requests for items to storage
 */
module.exports = modelFactory.new('Storage', {
  apiVersion: String,
  clientId: String,
  clientSecret: String,
  host: String,
  itemStorageEnabled: { type: Boolean, default: false },
  logoGlyphPath: String,
  name: { type: String, required: true },
  slug: String,
  passportStrategy: String,
  itemPutUrlTemplate: {
    type: String,
    default: 'https://${host}${path}?access_token=${accessToken}'
  }
}, {
  jsonapi: {
    delete: 'admin',
    filteredProperties: ['clientId', 'clientSecret'],
    get: 'public',
    patch: 'admin',
    post: 'admin'
  }
}, {
  /**
   * Returns headers used to make requests to storage
   * @instance
   * @param {Object} path - Path at which to put item
   * @param {Object} userStorageAuth - UserStorageAuth used to make request
   * @returns {string} URL
   */
  headers: function(path, userStorageAuth) {
    return {
      'Authorization': 'Bearer ' + userStorageAuth.storageToken,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        autorename: false,
        mode: 'add',
        mute: true,
        path: path
      })
    };
  },

  /**
   * Returns URL for making PUT request for item to storage
   * @instance
   * @param {Object} path - Path at which to put item
   * @param {Object} userStorageAuth - UserStorageAuth used to make request
   * @returns {string} URL
   */
  itemPutUrl: function(path, userStorageAuth) {
    validateParams([{
      name: 'path', variable: path, required: true, requiredType: 'string',
    }, {
      name: 'userStorageAuth', variable: userStorageAuth, required: true, requiredProperties: ['storageToken']
    }]);

    return templateCompiler(this.itemPutUrlTemplate, {
      accessToken: userStorageAuth.storageToken,
      apiVersion: this.apiVersion,
      host: this.host,
      path: path
    });
  }
});