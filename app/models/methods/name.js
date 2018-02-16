var _ = require('lodash');
var pluralize = require('pluralize');

module.exports = {
  /**
   * Returns camel-case name for this content type
   * @instance
   * @returns {string}
   */
  camelName: function() {
    return _.camelCase(this.name);
  },

  /**
   * Returns kebab-case name for this content type
   * @instance
   * @returns {string}
   */
  kebabName: function() {
    return _.kebabCase(this.name);
  },

  /**
   * Returns camel-case name for this content type
   * @instance
   * @returns {string}
   */
  lowercaseName: function() {
    return _.toLower(this.camelName());
  },

  /**
   * Returns plural camel-case name for this content type
   * @instance
   * @returns {string}
   */
  pluralCamelName: function() {
    return pluralize(this.camelName());
  },

  /**
   * Returns plural lowercase name for this content type
   * @instance
   * @returns {string}
   */
  pluralLowercaseName: function() {
    return _.toLower(this.pluralCamelName());
  },

  /**
   * Returns plural kebab-case name for this content type
   * @instance
   * @returns {string}
   */
  pluralKebabName: function() {
    return pluralize(_.kebabCase(this.name));
  }
};
