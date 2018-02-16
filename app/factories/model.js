/**
 * @module
 */

var _ = require('lodash'),
  mongoose = require('app/lib/mongoose'),
  mongooseAutopopulate = require('mongoose-autopopulate'),
  pluralize = require('pluralize'),
  unpopulatedProperties = require('app/lib/unpopulatedProperties');

module.exports = {
  /**
   * Return new Mongoose model
   * @param {string} name - Name of model (in camel case with uppercase first letter e.g. "BlogPost")
   * @param {Object} properties - Mongoose model properties
   * @param {Object} statics - Static methods and properties for new model
   * @param {Object} methods - Instance methods for new model
   * @param {function} schemaMods - Function that receives Schema as parameter and makes modifications to it (e.g. addition of middleware) before model creation
   * @returns {Object} Mongoose model
   */
  new: function(name, properties, statics, methods, schemaMods) {
    // Add default definition to properties with references and load reference schemas
    Object.keys(properties).forEach(function(key) {
      var modifiedProperty = (property) => {
        if (property.ref) {
          property.autopopulate = true;
          property.type = mongoose.Schema.Types.ObjectId;
        }

        return property;
      };

      if (Array.isArray(properties[key]) && properties[key].length === 1) {
        properties[key][0] = modifiedProperty(properties[key][0]);
      } else {
        properties[key] = modifiedProperty(properties[key]);
      }
    });

    var Schema = mongoose.Schema(properties, {
      timestamps: true
    });

    Schema.set('toObject', { getters: true });
    Schema.options.toObject.transform = mongoose.transform;

    Schema.statics.findOrCreate = function(properties, done) {
      properties = unpopulatedProperties(properties);

      this.findOne(properties, (error, document) => {
        if (error) {
          return done(error);
        }

        if (document) {
          done(undefined, document);
        } else {
          this.create(properties, (error, document) => {
            if (error) { return done(error); }

            this.findOne({
              _id: document.id
            }, (error, document) => {
              done(error, document);
            });
          });
        }
      });
    };

    /**
     * Returns pluralized model name in camel case with lowercase first letter (e.g. "blogPosts")
     * @returns {string} Model type
     */
    Schema.statics.modelType = Schema.methods.modelType = function() {
      var name = this.modelName ? this.modelName : this.constructor.modelName;

      if (name) {
        return pluralize(_.lowerFirst(name));
      }
    };

    /**
     * Returns singular model name in camel case with lowercase first letter (e.g. "blogPost")
     * @returns {string} Model ID
     */
    Schema.statics.modelId = Schema.methods.modelId = function() {
      var name = this.modelName ? this.modelName : this.constructor.modelName;

      if (name) {
        return _.lowerFirst(name);
      }
    };

    var key;

    if (statics) {
      for (key in statics) {
        Schema.statics[key] = statics[key];
      }
    }

    if (methods) {
      for (key in methods) {
        Schema.methods[key] = methods[key];
      }
    }

    Schema.pre('save', function(next) {
      this.wasNew = this.isNew;
      next();
    });

    if (schemaMods) {
      schemaMods(Schema);
    }

    Schema.plugin(mongooseAutopopulate);

    return mongoose.model(name, Schema);
  }
};
