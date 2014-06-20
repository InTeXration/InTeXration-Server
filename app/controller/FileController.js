var p = require('path'),
    fs = require('fs'),
    CONFIG = require('config');

function FileController(mongoose){

    var serve = function(req, res, ext){

        var addExtension = function(name){
            return name + '.' + ext;
        };

        var owner = req.params.owner;
        var repo = req.params.repo;
        var name = req.params.name;
        var file = addExtension(name);
        var filePath = p.join(CONFIG.storage, owner, repo, name, file);
        fs.exists(filePath, function(exists) {
            if (exists) res.status(200).sendfile(filePath);
            else res.status(404).json({message: "The Requested File Does Not Exist"})
        });
    };

    this.getPdf = function(req, res){
        serve(req, res, 'pdf');
    };

    this.getPdf = function(req, res){
        serve(req, res, 'log');
    };}

module.exports = FileController;