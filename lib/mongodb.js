var logger = require('./logger');

var db    = 'asheville';
var host  = 'mongodb://' + process.env.ASHEVILLE_SYNC_MONGODB_HOST || logger.crit('MongoDB host not provided by environment for config');
var port  = process.env.ASHEVILLE_SYNC_MONGODB_PORT || logger.crit('MongoDB port not provided by environment for config');

module.exports.url = host + ':' + port + '/' + db;