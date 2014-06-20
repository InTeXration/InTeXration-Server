var Schema = require('./../Schema');

function BuildController(mongoose){

    this.getAll = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.find({}, function(err, builds){
            res.json(builds);
        });
    };

    this.getByOwner = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.find({"owner": req.params.owner}, function(err, builds){
            res.json(builds);
        });
    };

    this.getByRepo = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.find({"owner": req.params.owner, "repo": req.params.repo}, function(err, builds){
            res.json(builds);
        });
    }
}

module.exports = BuildController;