var Schema = require('./../Schema');

function DocumentController(mongoose){
    this.getAll = function (req, res) {
        var Document = mongoose.model('Document', Schema.documentSchema);
        Document.find({}, function(err, documents){
            res.json(documents);
        });
    };
}

module.exports = DocumentController;