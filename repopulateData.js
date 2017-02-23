/**
 * Script to clear the database and populate it with objects represented by data files
 */

require('./lib/env')();
var async = require('async');
var debug = require('./lib/debug')('syncServer:loadData');
var fs = require('fs');
var models = require('./models');
var mongoose = require('./lib/mongoose');
var path = require('path');
var pluralize = require('pluralize');

var filenames = fs.readdirSync(path.join(__dirname, 'data'));

debug.start('# data repopulation');

var loadFile = (filename, done) => {
  debug.start('data population with file: %s', filename);

  var readFile = function(done) {
    var filePath = path.join(__dirname, 'data', filename);
    fs.readFile(filePath, 'utf8', done);
  };

  var saveObjects = function(resourceDocument, done) {
    resourceDocument = JSON.parse(resourceDocument);

    async.each(resourceDocument.data, (resourceObject, done) => {
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
    }, done);
  };

  async.waterfall([readFile, saveObjects], (error) => {
    if (error) {
      debug.error('data repopulation with file: %s', error.message);
    } else {
      debug.success('data population with file: %s', filename);
    }

    done(error);
  });
};

var saveRelationship = function(document, relationshipName, resourceObject, isArray, done) {
  var modelId = pluralize.singular(resourceObject.type);

  models[modelId].findOne(resourceObject.attributes, (error, relatedDocument) => {
    if (!relatedDocument) {
      done(new Error('Unable to find related document referenced by resourceObject'));
    } else {

      if (isArray) {
        if (!document[relationshipName]) {
          document[relationshipName] = [];
        } 

        document[relationshipName].push(relatedDocument);
      } else {
        document[relationshipName] = relatedDocument;
      }

      document.save(done);
    }
  });
};

var clearDatabase = function(done) {
  mongoose.removeCollections((error) => {
    if (!error) {
      debug.success('## clearDatabase');
    }

    done(error);
  });
};

var populate = function(done) {
  debug.start('## data population');

  async.eachSeries(filenames, loadFile, (error) => {
    if (!error) {
      debug.success('## data population');
    }

    done(error);
  });
};

async.series([clearDatabase, populate], (error) => {
  if (error) {
    debug.error('# data repopulation: %s', error.message);
  } else {
    debug.success('# data repopulation');
  }

  process.exit();
});