var Q = require('q'),
    p = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec;

function DocumentBuilder(document, dir){

    var directory = p.join(dir, document.dir);

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
        console.info("Building started in " + directory);
        var deferred = Q.defer();
        this.makeLatex(null)
            .then(this.makeBibtex, console.error)
            .then(this.makeIndex, console.error)
            .then(this.makeLatex, console.error)
            .then(this.makeLatex, console.error)
            .then(this.makeDocument, console.error)
            .then(deferred.resolve, deferred.reject);
        return deferred.promise;
    };

    this.makeIndex = function(){
        console.info("Make Index");
        var deferred = Q.defer();
        var command = "makeindex " + fileNames.idx;
        exec(command, {"cwd": directory}, function(err){
            if (err) console.warn(err);
            deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeBibtex = function(){
        console.info("Make BibTex");
        var deferred = Q.defer();
        var command = "bibtex " + fileNames.bib;
        exec(command, {"cwd": directory}, function(err){
            if (err) console.warn(err);
            deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeLatex = function(){
        console.info("Make Latex");
        var deferred = Q.defer();
        var command = "pdflatex -interaction=nonstopmode " + fileNames.tex;
        exec(command, {"cwd": directory}, function(err){
            if (err) deferred.reject(err);
            else deferred.resolve();
        });
        return deferred.promise;
    };

    this.makeDocument = function(){
        console.info("Make Files");
        var makeFile = function(type){
            var deferred = Q.defer();
            var name = fileNames[type];
            var path = directory;
            fs.exists(p.join(path, name), function(exists){
                if (!exists)  deferred.resolve(null);
                else deferred.resolve({
                    type: type,
                    name: name,
                    dir: path
                });
            });
            return deferred.promise;
        };
        return Q.spread([
            makeFile('pdf'),
            makeFile('log')
        ], function(pdf, log){
            return {
                name: document.name,
                files: [pdf, log]
            };
        }, console.error);
    };
}

module.exports = DocumentBuilder;