var _ = require('underscore'),
    Q = require('q'),
    p = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    mkdirp = require('mkdirp'),
    DocumentBuilder = require('./DocumentBuilder'),
    logger = require('../common/Logger'),
    CONFIG = require('config');

function RepoBuilder(hook, directory){

    var CONFIG_FILE = '.intexration';
    var timestamp =  Date.now();

    logger.info('Repository Builder (%s) created', timestamp, {hook: hook, dir: directory});

    this.build = function(){
        var deferred = Q.defer();
        this.clone()
            .then(this.parse, function(err){
                logger.error('Repository Builder (%s): Clone Failed', timestamp, {error: err});
            })
            .then(this.makeDocuments, function(err){
                logger.error('Repository Builder (%s): Make Documents Failed', timestamp, {error: err});
            })
            .then(this.moveDocuments, function(err){
                logger.error('Repository Builder (%s): Move Documents Failed', timestamp, {error: err});
            })
            .then(this.makeBuild)
            .then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };

    this.clone = function (callback) {
        logger.debug('Repository Builder (%s): Clone', timestamp);
        var deferred = Q.defer();
        var command = "git clone " + hook.url + " " + directory;
        exec(command, {"cwd": directory}, function (err) {
            if (err) deferred.reject(err);
            else deferred.resolve();
        });
        return deferred.promise;
    };

    this.parse = function () {
        logger.debug('Repository Builder (%s): Parse', timestamp);
        var deferred = Q.defer();
        var file = p.join(directory, CONFIG_FILE);
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) deferred.reject(err);
            else {
                var config = JSON.parse(data);
                var documents = [];
                _.each(config.documents, function(document) {
                    document.build = hook;
                    documents.push(document)
                });
                deferred.resolve(documents);
            }
        });
        return deferred.promise;
    };

    this.makeDocuments = function(documents) {
        logger.debug('Repository Builder (%s): Make Documents', timestamp, {documents: documents});

        var deferred = Q.defer();

        var make = function(document){
            var deferred = Q.defer();
            var path = p.join(hook.owner, hook.repo, document.name);
            mkdirp(path, function (err) {
                if (err) logger.error('Repository Builder (%s): Make Documents Failed', timestamp, {error: err});
                else {
                    var documentBuilder = new DocumentBuilder(document, directory, path);
                    documentBuilder.build().then(deferred.resolve, deferred.error);
                }
            });
            return deferred.promise;

        };
        var promises = [];
        documents.forEach(function (document) {
            promises.push(make(document));
        });
        Q.allSettled(promises).then(function(results){
            var newDocuments = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    newDocuments.push(result.value);
                }
            });
            deferred.resolve(newDocuments);
        });
        return deferred.promise;
    };

    this.moveDocuments = function(documents){
        logger.debug('Repository Builder (%s): Move Documents', timestamp, {documents: documents});
        var deferred = Q.defer();
        var moveFile = function(file, dir){
            var deferred = Q.defer();
            if(file === null)
                deferred.reject(new Error("Cannot move: file is null."));
            var oldPath = p.join(file.path, file.name);
            var newPath = p.join(CONFIG.storage.path, dir, file.name);
            fs.rename(oldPath, newPath, function(err){
                if (err) {
                    logger.error('Repository Builder (%s): Unable to move file', timestamp, {oldPath: oldPath, newPath:newPath});
                    deferred.resolve(null);
                }else {
                    file.path = dir;
                    deferred.resolve(file);
                }
            });
            return deferred.promise;
        };

        var moveDoc = function(document){
            var deferred = Q.defer();
            var promises = [];
            var dir = p.join(hook.owner, hook.repo, document.name);
            document.files.forEach(function(file){
                promises.push(moveFile(file,dir));
            });
            Q.allSettled(promises).then(function(results){
                var newFiles = [];
                results.forEach(function (result) {
                    if (result.state === "fulfilled") {
                        var file = result.value;
                        if(file !== null) newFiles.push(file);
                    }
                });
                deferred.resolve({
                    name: document.name,
                    timestamp: document.timestamp,
                    files: newFiles
                });
            });
            return deferred.promise;
        };

        var promises = [];
        documents.forEach(function (document) {
            promises.push(moveDoc(document));
        });
        Q.allSettled(promises).then(function(results){
            var newDocuments = [];
            results.forEach(function (result) {
                if (result.state === "fulfilled") {
                    newDocuments.push(result.value);
                }
            });
            deferred.resolve(newDocuments);
        });
        return deferred.promise;
    };

    this.makeBuild = function(documents){
        return {
            buildhook: hook,
            documents: documents,
            timestamp: Date.now()
        };
    };
}

module.exports = RepoBuilder;