var fs = require('fs');
var path = __dirname + '/../.env';

if (fs.existsSync(path)) {
  require('dotenv').config({ path: path });
}