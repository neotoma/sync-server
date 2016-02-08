var logger = require('./logger');

var db    = 'asheville';
var host  = 'mongodb://' + process.env.ASHEVILLE_SYNC_MONGODB_HOST || logger.fatal('MongoDB host not provided by environment for config');
var port  = process.env.ASHEVILLE_SYNC_MONGODB_PORT || logger.fatal('MongoDB port not provided by environment for config');

module.exports.url = host + ':' + port + '/' + db;