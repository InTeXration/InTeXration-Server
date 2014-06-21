var _ = require('underscore'),
    Schema = require('./../common/Schema');

function BuildController(mongoose){

    this.getAll = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.find({}, {}, { sort: { _id : -1 } }, function(err, builds){
            if(err) res.status(500).json({message: err.message});
            else res.json(builds);
        });
    };

    this.get = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.findOne({"blueprint.owner": req.params.owner, "blueprint.repo": req.params.repo}, {}, { sort: { _id : -1 } }, function(err, build){
            if(err) res.status(500).json({message: err.message});
            else res.json(build);
        });
    };
}

module.exports = BuildController;