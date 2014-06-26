var _ = require('underscore'),
    Schema = require('./../common/Schema');

function BuildController(mongoose){

    this.getAll = function (req, res) {
        var Build = mongoose.model(Schema.build.name, Schema.build.schema);
        Build.find({}, {}, { sort: { _id : -1 } }, function(err, builds){
            if(err) res.status(500).json({message: err.message});
            else res.json(builds);
        });
    };

    this.get = function (req, res) {
        var Build = mongoose.model(Schema.build.name, Schema.build.schema);
        Build.findOne({"hook.owner": req.params.owner, "hook.repo": req.params.repo}, {}, { sort: { _id : -1 } }, function(err, build){
            if(err) res.status(500).json({message: err.message});
            else res.json(build);
        });
    };
}

module.exports = BuildController;