/**
 * Job model
 * @module
 */

var async = require('async');
var debug = require('app/lib/debug')('syncServer:job');
var logger = require('app/lib/logger');
var modelFactory = require('app/factories/model');
var queryConditions = require('./queryConditions');

/**
 * Represents job scheduled for execution for related documents
 * @class Job
 * @property {module:models/contentType~ContentType} [contentType] - ContentType for which this job should be executed
 * @property {('storeAllItemsForUserStorageSource'|'storeAllItemsForUserStorageSourceContentType')} name - Enumerated name of job
 * @property {module:models/source~Source} [source] - Source for which this job should be executed
 * @property {module:models/storage~Storage} [storage] - Storage for which this job should be executed
 * @property {module:models/user~User} [user] - User for which this job should be executed
 */
module.exports = modelFactory.new('Job', {
  contentType: {ref: 'ContentType'},
  name: {
    type: String,
    required: true,
    validate: {
      validator: function(value) {
        return (['storeAllItemsForUserStorageSource', 'storeAllItemsForUserStorageSourceContentType'].indexOf(value) > -1);
      },
      message: '"{VALUE}" is not a supported name value'
    }
  },
  source: {ref: 'Source'},
  storage: {ref: 'Storage'},
  user: {ref: 'User'},
  totalItemsAvailable: Number,
  totalItemsStored: Number
}, {
  jsonapi: {
    get: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    },
    post: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    },
    delete: {
      allowed: 'user',
      queryConditions: queryConditions.userMatchesRequester
    }
  }
}, {
  incrementTotalItemsStored() {
    if (this.totalItemsStored) {
      this.totalItemsStored++;
    } else {
      this.totalItemsStored = 1;
    }

    this.save();
  },

  updateTotalItemsAvailable(total) {
    this.totalItemsAvailable = this.totalItemsAvailable ? total + this.totalItemsAvailable : total;
    this.save();
  }
}, function(schema) {
  schema.post('save', function() {
    var itemController = require('app/controllers/item');
    var job = this;

    if (!job.wasNew) {
      return;
    }

    var populate = function(done) {
      job.populate('contentType source storage user', done);
    };

    var runJob = function(done) {
      switch (job.name) {
      case 'storeAllItemsForUserStorageSource':
        debug('running job "storeAllItemsForUserStorageSource": user %s, source %s, storage %s', job.user.id, job.source.id, job.storage.id);
        itemController.storeAllForUserStorageSource(job.user, job.source, job.storage, job, done);
        break;

      case 'storeAllItemsForUserStorageSourceContentType':
        debug('running job "storeAllItemsForUserStorageSourceContentType"');
        itemController.storeAllForUserStorageSourceContentType(job.user, job.source, job.storage, job.contentType, job, done);
        break;

      default:
        done();
      }
    };

    async.series([populate, runJob], (error) => {
      var log = logger.scopedLog({jobId: job.id});

      if (error) {
        debug.error('# job failed: %s', error.message);
        log('error', error.message);
      } else {
        debug.success('# job succeeded');
        log('info', 'Finished running job post-save');
      }
    });
  });
});