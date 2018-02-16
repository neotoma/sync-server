/**
 * Job model
 * @module
 */

var async = require('async'),
  debug = require('app/lib/debug')('app:job'),
  logger = require('app/lib/logger'),
  modelFactory = require('app/factories/model'),
  queryConditions = require('./queryConditions')

/**
 * Represents job scheduled for execution for related documents
 *
 * @class Job
 * @property {module:models/contentType~ContentType} [contentType] - ContentType for which this job should be executed
 * @property {('storeAllItemsForUserStorageSource'|'storeAllItemsForUserStorageSourceContentType')} name - Enumerated name of job
 * @property {module:models/source~Source} [source] - Source for which this job should be executed
 * @property {module:models/storage~Storage} [storage] - Storage for which this job should be executed
 * @property {module:models/user~User} [user] - User for which this job should be executed
 */
module.exports = modelFactory.new('Job', {
  contentType: { ref: 'ContentType' },
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
  source: { ref: 'Source' },
  storage: { ref: 'Storage' },
  user: { ref: 'User' },
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
    // eslint-disable-next-line global-require
    let storeAllForUserStorageSource = require('app/controllers/item/storeAllForUserStorageSource'),
      storeAllForUserStorageSourceContentType = require('app/controllers/item/storeAllForUserStorageSourceContentType');

    if (!this.wasNew) {
      return;
    }

    var populate = (done) => {
      this.populate('contentType source storage user', done);
    };

    var runJob = (done) => {
      switch (this.name) {
      case 'storeAllItemsForUserStorageSource':
        if (!this.user || !this.source || !this.storage) {
          return done(new Error('Missing user, source or storage upon starting to run storeAllItemsForUserStorageSource job'));
        }

        debug('running job "storeAllItemsForUserStorageSource": user %s, source %s, storage %s', this.user.id, this.source.id, this.storage.id);
        storeAllForUserStorageSource(this.user, this.source, this.storage, this, done);
        break;

      case 'storeAllItemsForUserStorageSourceContentType':
        if (!this.user || !this.source || !this.storage || this.contentType) {
          return done(new Error('Missing contentType, user, source or storage upon starting to run storeAllItemsForUserStorageSourceContentType job'));
        }

        debug('running job "storeAllItemsForUserStorageSourceContentType": contentType %s, user %s, source %s, storage %s', this.contentType, this.user.id, this.source.id, this.storage.id);
        storeAllForUserStorageSourceContentType(this.user, this.source, this.storage, this.contentType, this, done);
        break;

      default:
        done();
      }
    };

    async.series([populate, runJob], (error) => {
      var log = logger.scopedLog({ jobId: this.id });

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
