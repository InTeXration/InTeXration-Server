var Schema = require('./../Schema');

function BuildController(mongoose){

    var convert = function(build){
        return build
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