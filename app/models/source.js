/**
 * Source model
 * @module
 */

var debug = require('app/lib/debug')('syncServer:models/source.js');
var templateCompiler = require('es6-template-strings');
var modelFactory = require('app/factories/model');
var nameMethods = require('./methods/name');
var SourceContentType = require('app/models/sourceContentType');

var methods = Object.assign({
  itemDataObjectsFromPagePath: function(contentType) {
    return templateCompiler(this.itemDataObjectsFromPagePathTemplate, {
      contentTypePluralCamelName: contentType ? contentType.pluralCamelName() : undefined,
      contentTypePluralLowercaseName: contentType ? contentType.pluralLowercaseName() : undefined
    });
  },

  totalItemsAvailableFromPagePath: function(contentType) {
    return templateCompiler(this.totalItemsAvailableFromPagePathTemplate, {
      contentTypePluralCamelName: contentType ? contentType.pluralCamelName() : undefined,
      contentTypePluralLowercaseName: contentType ? contentType.pluralLowercaseName() : undefined
    });
  },

  /**
   * returns the contentTypes associated with this source
   * @param done {Function} A callback that will be passed a the error (Error) and optionally the contentTypes results
   */
  getContentTypes: function(done) {
    debug(this);
    debug("this.id = %O",this.id);

    SourceContentType.find({ source: this._id }, function(err, sourceContentTypes) {
      if (err) {
        return done(err);
      } else {
        debug("sourceContentTypes = %O", sourceContentTypes);
        done(err, sourceContentTypes.map((sourceContentType) => sourceContentType.contentType));
      }
    });
  }

}, nameMethods);

/**
 * Represents source of items for storage
 * @class Source
 * @property {number} apiVersion - Version of API to use for pulling items from source
 * @property {string=} clientId - OAuth 2.0 client ID
 * @property {string=} clientSecret - OAuth 2.0 client secret
 * @property {boolean} [itemStorageEnabled=false] - Whether source is enabled for storing items in storage
 * @property {string} [host] - Host URL for source (e.g. "api.foursquare.com")
 * @property {number} [itemsLimit=25] - Maximum number of items to pull from source in a single page request
 * @property {string} [logoGlyphPath] - URL path to logo glyph image file on host (e.g. "/images/logos/foursquare-glyph.svg")
 * @property {string} name - Name of source (e.g. "foursquare")
 * @property {string} [passportStrategy] - Strategy for Passport module (e.g. "passport-foursquare")
 * @property {string} [itemDataObjectsFromPagePathTemplate=data] - String template used to generate object paths to itemDataObjects found within pages returned from source
 * @property {string} [totalItemsAvailableFromPagePathTemplate=response.${contentTypePluralCamelName}.count] - String template used to generate object paths to value representing total items available for contentType within pages returned from source
 */
module.exports = modelFactory.new('Source', {
  apiVersion: String,
  authScope: Array,
  clientId: String,
  clientSecret: String,
  itemDataObjectsFromPagePathTemplate: { type: String, default: 'data' },
  itemStorageEnabled: { type: Boolean, default: false },
  host: String,
  itemsLimit: { type: Number, default: 25 },
  logoGlyphPath: String,
  name: { type: String, required: true },
  passportStrategy: String,
  slug: String,
  totalItemsAvailableFromPagePathTemplate: String
}, {
  jsonapi: {
    delete: 'admin',
    filteredProperties: ['clientId', 'clientSecret'],
    get: 'public',
    patch: 'admin',
    post: 'admin'
  }
}, methods);