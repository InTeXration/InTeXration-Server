var p = require('path'),
    Q = require('q'),
    fs = require('fs'),
    LogParser = require('../common/LogParser'),
    CONFIG = require('config');

function FileController(mongoose) {

    var logParser = new LogParser();
    var LOG = 'log';
    var PDF = 'pdf';

    var path = function(owner, repo, name, type){
        var deferred = Q.defer();
        var addExtension = function (name) {
            return name + '.' + type;
        };
        var file = addExtension(name);
        var filePath = p.join(CONFIG.storage.path, owner, repo, name, file);
        fs.exists(filePath, function (exists) {
            if (exists) deferred.resolve(filePath);
            else deferred.reject(new Error('File not found'));
        });
        return deferred.promise;
    };

    var serve = function (req, res, type) {
        var owner = req.params.owner;
        var repo = req.params.repo;
        var name = req.params.name;

        path(owner, repo, name, type).then(function(path){
            res.status(200).sendfile(path);
        }, function(err){
            res.status(404).json({message: err.message})
        });
    };

    this.getPdf = function (req, res) {
        serve(req, res, PDF);
    };

    this.getLog = function (req, res) {
        serve(req, res, LOG);
    };

    this.getData = function (req, res) {

        path(req.params.owner, req.params.repo, req.params.name, LOG).then(logParser.parse).then(function(data){
            res.status(200).json(data);
        }, function(err){
            res.status(404).json({message: err.message})
        })
    };
}

module.exports = FileController;