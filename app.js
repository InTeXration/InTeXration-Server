var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var CONFIG = require('config');

var HookController = require('./app/controller/HookController');
var BlueprintController = require('./app/controller/BlueprintController');
var FileController = require('./app/controller/FileController');
var BuildController = require('./app/controller/BuildController');

mongoose.connect('mongodb://'+CONFIG.mongo.host+':'+CONFIG.mongo.port+'/'+CONFIG.mongo.db);

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// Routers
var hookController = new HookController(mongoose);
app.post('/hook/:key', function(req, res){
    hookController.post(req, res)
});

var blueprintController = new BlueprintController(mongoose);
app.get('/blueprint',  function(req, res){
    blueprintController.getAll(req, res);
});
app.get('/blueprint/:owner', function(req, res){
    blueprintController.getByOwner(req, res);
});
app.get('/blueprint/:owner/:repo',  function(req, res){
    blueprintController.getByRepo(req, res);
});

var buildController = new BuildController(mongoose);
app.get('/build',  function(req, res){
    buildController.getAll(req, res);
});

var fileController = new FileController(mongoose);
app.get('/file/:owner/:repo/:name/pdf', function(req, res){
    fileController.getPdf(req, res);
});
app.get('/file/:owner/:repo/:name/log', function(req, res){
    fileController.getLog(req, res);
});

app.get('*', function(req, res){
    res.json({"message": "To be replaced with Front-End"});
});

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
