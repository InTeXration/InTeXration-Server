var _ = require('underscore'),
    Q = require('q'),
    p = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    mkdirp = require('mkdirp'),
    DocumentBuilder = require('./DocumentBuilder'),
    CONFIG = require('config');

function RepoBuilder(blueprint, directory){

    var CONFIG_FILE = '.intexration';

    this.build = function(){
        var deferred = Q.defer();
        this.clone()
            .then(this.parse, console.error)
            .then(this.makeDocuments, console.error)
            .then(this.moveDocuments, console.error)
            .then(this.makeBuild, console.error)
            .then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };

    this.clone = function (callback) {
        var deferred = Q.defer();
        var command = "git clone " + blueprint.url + " " + directory;
        exec(command, {"cwd": directory}, function (err) {
            if (err) deferred.reject(err);
            else deferred.resolve();
        });
        return deferred.promise;
    };

    this.parse = function () {
        var deferred = Q.defer();
        var file = p.join(directory, CONFIG_FILE);
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) deferred.reject(err);
            else {
                var config = JSON.parse(data);
                var documents = [];
                _.each(config.documents, function(document) {
                    document.build = blueprint;
                    documents.push(document)
                });
                deferred.resolve(documents);
            }
        });
        return deferred.promise;
    };

    this.moveDocuments = function(documents){
        var deferred = Q.defer();

        var moveFile = function(file, dir){
            var deferred = Q.defer();
            if(file === null)
                deferred.reject(new Error("Cannot move: file is null."));
            var oldPath = p.join(file.dir, file.name);
            var newPath = p.join(dir, file.name);
            fs.rename(oldPath, newPath, function(err){
                if (err) deferred.reject(err);
                else {
                    file.dir = dir;
                    deferred.resolve(file);
                }
            });
            return deferred.promise;
        };

        var moveDoc = function(document){
            var deferred = Q.defer();
            var promises = [];
            var dir = p.join(CONFIG.storage, blueprint.owner, blueprint.repo, document.name);
            document.files.forEach(function(file){
                promises.push(moveFile(file,dir));
            });
            Q.allSettled(promises).then(function(results){
                var newFiles = [];
                results.forEach(function (result) {
                    if (result.state === "fulfilled") {
                        newFiles.push(result.value);
                    }
                });
                deferred.resolve({
                    name: document.name,
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

    this.makeDocuments = function(documents) {
        var deferred = Q.defer();

        var make = function(document){
            var deferred = Q.defer();
            path = p.join(CONFIG.storage, blueprint.owner, blueprint.repo, document.name);
            mkdirp(path, function (err) {
                var documentBuilder = new DocumentBuilder(document, directory, path);
                documentBuilder.build().then(deferred.resolve, deferred.error);
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

    this.makeBuild = function(documents){
        return {
            blueprint: blueprint,
            timestamp: Date.now(),
            documents: documents
        };
    }
}

module.exports = RepoBuilder;