/**
 * Function to create documents indicated by populated properties declared by modelFixture schema
 * @module
 */

var _ = require('lodash');
var async = require('async');
var debug = require('debug')('syncServer:tests:createPopulatedProperties');
var wh = require('app/lib/warehouse');

/**
 * Creates all mock documents related to a model's fixture schema as populated properties
 */
module.exports = function(modelFixture, properties) {
  return (done) => {
    if (modelFixture.schemaProperties) {
      debug('creating populated properties %O', properties);

      async.each(Object.keys(modelFixture.schemaProperties), (name, done) => {
        if (modelFixture.schemaProperties[name].ref) {
          debug('creating %s document %O', modelFixture.schemaProperties[name].ref, properties[name]);
          
          var document = wh.oneSaved(_.lowerFirst(modelFixture.schemaProperties[name].ref), properties[name], (error, document) => {
            if (!error) {
              debug('created %s document %O', modelFixture.schemaProperties[name].ref, document);
            }

            done(error, document);
          });
        } else {
          done();
        }
      }, done);
    } else {
      done();
    }
  };
};