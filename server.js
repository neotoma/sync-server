var express = require('express');
var app = express();
app.config = require('./config');

var mongoose = require('./mongoose')(app);

app.model = {
  user: require('./models/user')(mongoose)
};

var passport = require('./passport')(app);

app.use(express.logger({ immediate: true, format: "\033[37m:method :url\033[37m (:date)\033[0m" }));
app.use(express.cookieParser());
app.use(express.session({ secret: app.config.session.secret }));
app.use(passport.initialize());
app.use(passport.session());

var storages = require('./storages')(app, passport);
app.authFilter = storages.dropbox.authFilter;

var sources = require('./sources')(app, passport, storages);

var server = app.listen(app.config.port);

console.log('listening on', app.config.port);