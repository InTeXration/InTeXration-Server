var _ = require('underscore'),
    Schema = require('./../Schema'),
    CONFIG = require('config');

function BuildController(mongoose){

    var convert = function(build){

        var makeUrl = function(owner, repo, name, type){
            return CONFIG.url + '/file/' + owner + '/' + repo + '/' + name + '/' + type;
        };

        var documents = []
        
        _.each(build.documents, function (document) {
            var files = [];
            _.each(build.document.files, function(file){
                files.push({
                    type: file.type,
                    name: file.name,
                    url: makeUrl(build.blueprint.owner, build.blueprint.repo, build.documents.name, file.type)
                });
            });
            document.files = files;
            documents.push(document);
        });
        build.documents = documents;
        return build;
    };

    this.get = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.findOne({"blueprint.owner": req.params.owner, "blueprint.repo": req.params.repo}, {}, { sort: { 'created_at' : 1 } }, function(err, build){
            if(err || build === null) res.status(404).json({message: 'No build found'});
            else res.json(convert(build));
        });
    };
}

module.exports = BuildController;