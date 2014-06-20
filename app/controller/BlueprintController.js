var Schema = require('./../Schema');

function BuildController(mongoose){

    this.getAll = function (req, res) {
        var Blueprint = mongoose.model('Blueprint', Schema.blueprintSchema);
        Blueprint.find({}, function(err, blueprints){
            res.json(blueprints);
        });
    };

    this.getByOwner = function (req, res) {
        var Build = mongoose.model('Blueprint', Schema.blueprintSchema);
        Build.find({"owner": req.params.owner}, function(err, blueprints){
            res.json(blueprints);
        });
    };

    this.getByRepo = function (req, res) {
        var Build = mongoose.model('Blueprint', Schema.blueprintSchema);
        Build.find({"owner": req.params.owner, "repo": req.params.repo}, function(err, blueprints){
            res.json(blueprints);
        });
    }
}

module.exports = BuildController;