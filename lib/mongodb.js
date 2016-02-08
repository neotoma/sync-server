var logger = require('./logger');

var db    = 'sync';
var host  = 'mongodb://' + process.env.SYNC_MONGODB_HOST || logger.fatal('MongoDB host not provided by environment for config');
var port  = process.env.SYNC_MONGODB_PORT || logger.fatal('MongoDB port not provided by environment for config');

module.exports.url = host + ':' + port + '/' + db;