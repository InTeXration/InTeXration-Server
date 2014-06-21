var _ = require('underscore'),
    Schema = require('./../Schema'),
    CONFIG = require('config');

function BuildController(mongoose){

    this.get = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.findOne({"blueprint.owner": req.params.owner, "blueprint.repo": req.params.repo}, {}, { sort: { 'created_at' : 1 } }, function(err, build){
            if(err || build === null) res.status(404).json({message: 'No build found'});
            else res.json(build);
        });
    };
}

module.exports = BuildController;