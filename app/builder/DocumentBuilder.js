var Q = require('q'),
    p = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    logger = require('../Logger');

function DocumentBuilder(document, dir){
    var directory = p.join(dir, document.dir);
    var timestamp =  Date.now();

    logger.info('Document Builder (%s) created', timestamp, {document: document, dir: dir});

    var makeFileNames = function(){
        var addExtension = function(name, ext){
            return name + '.' + ext;
        };

        var tex = addExtension(document.name, 'tex');
        var pdf = addExtension(document.name, 'pdf');
        var log = addExtension(document.name, 'log');
        var idx, bib;
        if(document.idx){
            idx = document.idx;
        }else{
            idx = document.name;
        }
        if(document.bib){
            bib = document.bib;
        }else{
            bib = addExtension(document.name, 'bib');
        }
        return {
            tex: tex,
            pdf: pdf,
            log: log,
            idx: idx,
            bib: bib
        };
    };

    var fileNames = makeFileNames();

    this.build = function(){
        var deferred = Q.defer();
        this.makeLatex(null)
            .then(this.makeBibtex)
            .then(this.makeIndex)
            .then(this.makeLatex)
            .then(this.makeLatex)
            .then(this.makeDocument)
            .then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };

    this.makeIndex = function(){
        logger.debug('Document Builder (%s): Make Index', timestamp, {file: fileNames.idx});
        var deferred = Q.defer();
        var command = "makeindex " + fileNames.idx;
        exec(command, {"cwd": directory}, function(err){
            if (err) logger.warn('Document Builder (%s): Make Index Failed', timestamp, {error: err});
            deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeBibtex = function(){
        logger.debug('Document Builder (%s): Make BibTex', timestamp, {file: fileNames.bib});
        var deferred = Q.defer();
        var command = "bibtex " + fileNames.bib;
        exec(command, {"cwd": directory}, function(err){
            if (err) logger.warn('Document Builder (%s): Make BibTex Failed', timestamp, {error: err});
            deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeLatex = function(){
        logger.debug('Document Builder (%s): Make Latex', timestamp, {file: fileNames.tex});
        var deferred = Q.defer();
        var command = "pdflatex -interaction=nonstopmode " + fileNames.tex;
        exec(command, {"cwd": directory}, function(err){
            if (err) logger.error('Document Builder (%s): Make Latex Failed', timestamp, {error: err});
            else deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeDocument = function(){
        logger.debug('Document Builder (%s): Make Document', timestamp);
        var makeFile = function(type){
            var deferred = Q.defer();
            var name = fileNames[type];
            var path = directory;
            fs.exists(p.join(path, name), function(exists){
                if (!exists) {
                    logger.error('Document Builder (%s): File does not exist', timestamp, {file:name});
                    deferred.resolve(null);
                }else deferred.resolve({
                    type: type,
                    name: name,
                    path: path
                });
            });
            return deferred.promise;
        };
        return Q.spread([
            makeFile('pdf'),
            makeFile('log')
        ], function(pdf, log){
            var files = [];
            if(pdf !== null) files.push(pdf);
            if(log !== null) files.push(log);
            return {
                name: document.name,
                timestamp: Date.now(),
                files: files
            };
        });
    };
}

module.exports = DocumentBuilder;