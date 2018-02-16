/**
 * grunt-data-seed
 * @module
 */

'use strict';

var _ = require('lodash'),
  async = require('async'),
  debug = require('app/lib/debug')('app:loadData'),
  models = require('app/models'),
  mongoose = require('app/lib/mongoose'),
  parkRanger = require('park-ranger'),
  path = require('path'),
  pluralize = require('pluralize'),
  requireDir = require('require-dir');

var registerTask = function(grunt) {
  /**
   * Remove database collections and seed them with resourceObjects stored in files
   * @param {string} [args] – rsync arguments
   */
  grunt.registerTask('data-seed', 'Remove database collections and seed them with resourceObjects stored in files', function() {  
    parkRanger();

    var dataPath = path.resolve(process.env.SYNC_SERVER_DIR ? process.env.SYNC_SERVER_DIR : '/var/www/sync-server', 'data');

    debug.start('# repopulating collections: %s', dataPath);

    var done = this.async();
    var resourceDocuments = requireDir(path.resolve(process.cwd(), 'data'));

    debug.trace('# types: %s', Object.keys(resourceDocuments).join(', '));

    var saveRelationship = function(document, relationshipName, resourceObject, toMany, done) {
      debug.start('saveRelationship, name: %s', relationshipName);

      models[pluralize.singular(resourceObject.type)].findOne(resourceObject.attributes, (error, relatedDocument) => {
        if (!relatedDocument) {
          done(new Error('Unable to find related document referenced by resourceObject'));
        } else {
          if (toMany) {
            if (!document[relationshipName]) {
              document[relationshipName] = [];
            }

            document[relationshipName].addToSet(relatedDocument);
          } else {
            document[relationshipName] = relatedDocument;
          }

          document.save(done);
        }
      });
    };

    var saveResourceDocument = (resourceDocument, type, done) => {
      debug.start('saving resourceDocument: %s', type);

      async.each(resourceDocument.data, saveResourceObject, (error) => {
        if (error) {
          debug.error('failed to save resourceDocument: %s', error.message);
        } else {
          debug.success('saved resourceDocument: %s', type);
        }

        done(error);
      });
    };

    var saveResourceObject = function(resourceObject, done) {
      debug.start('saving resourceObject: type %s', resourceObject.type);

      models[pluralize.singular(resourceObject.type)].create(resourceObject.attributes, (error, document) => {
        if (error) {
          done(error);
        }
        
        if (resourceObject.relationships) {
          async.each(Object.keys(resourceObject.relationships), (relationshipName, done) => {
            var relationship = resourceObject.relationships[relationshipName];

            if (Array.isArray(relationship.data)) {
              async.each(relationship.data, (resourceObject, done) => {
                saveRelationship(document, relationshipName, resourceObject, true, done);
              }, done);
            } else {
              saveRelationship(document, relationshipName, relationship.data, false, done);
            }
          }, done);
        } else {
          done();
        }
      });
    };

    var populateCollections = function(done) {
      debug.start('## populating collections');

      async.eachOf(resourceDocuments, saveResourceDocument, (error) => {
        if (!error) {
          debug.success('## populated collections');
        }

        done(error);
      });
    };

    var removeCollections = function(done) {
      mongoose.removeCollections(Object.keys(resourceDocuments).map((type) => _.toLower(type)), done);
    };

    async.series([removeCollections, populateCollections], (error) => {
      if (error) {
        debug.error('# failed to seed data: %s', error.message);
      } else {
        debug.success('# seeded data');
      }

      done();
    });
  });
};

module.exports = registerTask;
