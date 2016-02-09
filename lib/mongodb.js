module.exports = function(skip_logger, database) {
  try {
    if (typeof process.env.SYNC_MONGODB_HOST === 'undefined') {
      throw new Error('MongoDB host not provided by environment');
    }

    if (typeof process.env.SYNC_MONGODB_PORT === 'undefined') {
      throw new Error('MongoDB port not provided by environment');
    }

    if (typeof database === 'undefined') {
      database = 'sync';
    }

    return {
      url: 'mongodb://' + process.env.SYNC_MONGODB_HOST + ':' + process.env.SYNC_MONGODB_PORT + '/' + database
    };
  } catch(e) {
    if (typeof skip_logger === 'undefined' || !skip_logger) {
      require('./logger').fatal(e.message);
    }

    return {
      url: null
    };
  }
}