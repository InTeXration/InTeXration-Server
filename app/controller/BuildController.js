var Schema = require('./../Schema');

function DocumentController(mongoose){
    this.getAll = function (req, res) {
        var Build = mongoose.model('Build', Schema.buildSchema);
        Build.find({}, function(err, builds){
            res.json(builds);
        });
    };
}

module.exports = DocumentController;