console.log('Starting sync app server');

var express = require('express');
var app = express();

var server = app.listen();

module.exports = app;

console.log('Sync app server started');