/**
 * Establish environment variables from config file
 * @module
 */

var dotenv = require('dotenv');
var fs = require('fs');

module.exports = (name) => {
  var suffix = name ? '-' + name : '';
  var path = __dirname + '/../.env' + suffix;

  if (fs.existsSync(path)) {
    dotenv.config({ path: path });
  }
};