var Schema = require('./../common/Schema');

function RepoController(mongoose){

    this.getAll = function (req, res) {
        var Repo = mongoose.model('Repo', Schema.repoSchema);
        Repo.find({}, function(err, repos){
            res.json(repos);
        });
    };

    this.get = function (req, res) {
        var Repo = mongoose.model('Repo', Schema.repoSchema);
        Repo.find({"owner": req.params.owner, "repo": req.params.repo}, function(err, repos){
            res.json(repos);
        });
    }
}

module.exports = RepoController;