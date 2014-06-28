var express = require('express');
var MongoStore = require('connect-mongo')(express);
var logger = require('./logger');
var app = express();
app.config = require('./config');

var mongoose = require('./mongoose')(app);

app.model = {
  user:             require('./models/user')(mongoose),
  userStorageAuth:  require('./models/user-storage-auth')(mongoose),
  userSourceAuth:   require('./models/user-source-auth')(mongoose),
  item:             require('./models/item')(mongoose)
};

var passport = require('./passport')(app);

app.use(express.logger({ immediate: true, format: "\033[37m:method :url\033[37m (:date)\033[0m" }));
app.use(express.cookieParser());
app.use(express.session({ 
  secret: app.config.session.secret,
  store: new MongoStore({
    url: app.config.mongodb.url
  })
}));
app.use(passport.initialize());
app.use(passport.session());

app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:9091');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

var sessions = require('./sessions')(app);
var storages = require('./storages')(app, passport);
app.authFilter = storages.dropbox.authFilter;
var sources = require('./sources')(app, passport, storages);
var storageSurveys = require('./storageSurveys')(app);

var server = app.listen(app.config.port);

logger.info('listening on', app.config.port);