var DROPBOX_AUTH_URL = 'https://www.dropbox.com/1/oauth2/authorize';

var Dropbox = require('dropbox');

var client = Dropbox.Client({
  key: process.env.DROPBOX_APP_KEY,
  secret: process.env.DROPBOX_APP_SECRET
});

exports.auth = function(req, res) {
  res.writeHead(303, { 'location' : DROPBOX_AUTH_URL });
  res.end();
}