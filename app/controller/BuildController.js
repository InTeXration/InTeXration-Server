var _ = require('underscore'),
    Schema = require('./../common/Schema');

function BuildController(mongoose){

    var Build = mongoose.model(Schema.build.name, Schema.build.schema);

    this.getAll = function (req, res) {
        Build.find({}, {}, { sort: { _id : -1 } }, function(err, builds){
            if(err) res.status(500).json({message: err.message});
            else res.json(builds);
        });
    };

    this.getByRepo = function (req, res) {
        Build.findOne({"hook.owner": req.params.owner, "hook.repo": req.params.repo}, {}, { sort: { _id : -1 } }, function(err, build){
            if(err) res.status(500).json({message: err.message});
            else res.json(build);
        });
    };

    this.get = function(req, res){
        Build.findById(req.id, function(err, build){
            res.json(build);
        })
    };
}

module.exports = BuildController;