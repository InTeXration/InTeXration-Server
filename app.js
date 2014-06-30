var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var CONFIG = require('config');

var HookController = require('./app/controller/HookController');
var FileController = require('./app/controller/FileController');
var BuildController = require('./app/controller/BuildController');
var ApiController = require('./app/controller/ApiController');
var UserManager = require('./app/manager/UserManager');

// Connect to MognoDB
mongoose.connect('mongodb://'+CONFIG.mongo.host+':'+CONFIG.mongo.port+'/'+CONFIG.mongo.db);

// Cross-Origin Resource Sharing
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
};

// Passport
var userManager = new UserManager(mongoose);
passport.use(new GitHubStrategy(CONFIG.oauth.github,
    function(accessToken, refreshToken, profile, done) {
        userManager.findOrCreate(profile, function (err, user) {
            return done(err, user);
        });
    }
));
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
var auth = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }else{
        res.send(401);
    }
};

// Express
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(allowCrossDomain);
app.use(cookieParser());
app.use(session({ secret: 'AKDFOOCH'}));
app.use(passport.initialize());
app.use(passport.session());

// Routers
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/', failureRedirect: '/' }));

var apiController = new ApiController(mongoose);
app.get('/api', auth, function(req, res){
    apiController.getAll(req, res);
});
app.get('/api/create', auth, function(req, res){
    apiController.getCreate(req, res);
});
app.get('/api/:key', auth, function(req, res){
    apiController.get(req, res);
});
app.delete('/api/:key', auth, function(req, res){
    apiController.remove(req, res);
});


var hookController = new HookController(mongoose, apiController);
app.post('/hook/:key', function(req, res){
    hookController.post(req, res)
});
app.get('/hook',  function(req, res){
    hookController.getAll(req, res);
});
app.get('/hook/:owner/:repo',  function(req, res){
    hookController.getByRepo(req, res);
});

var buildController = new BuildController(mongoose);
app.get('/build',  function(req, res){
    buildController.getAll(req, res);
});

app.get('/build/:owner/:repo',  function(req, res){
    buildController.getByRepo(req, res);
});

app.get('/build/:id',  function(req, res){
    buildController.get(req, res);
});

var fileController = new FileController(mongoose);
app.get('/file/:owner/:repo/:name/pdf', function(req, res){
    fileController.getPdf(req, res);
});
app.get('/file/:owner/:repo/:name/log', function(req, res){
    fileController.getLog(req, res);
});
app.get('/file/:owner/:repo/:name/data', function(req, res){
    fileController.getData(req, res);
});

// Static Files
app.use(express.static(path.join(__dirname, 'front')));
app.use(express.static(path.join(__dirname, 'public')));

// Error Handlers
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.error(err);
        res.status(err.status || 500);
        res.json({"abort": err, "message": err.message});
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.error(err);
    res.json({"message": err.message});
});

module.exports = app;