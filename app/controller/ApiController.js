var Schema = require('./../common/Schema'),
    logger = require('../common/Logger');

function ApiManager(mongoose){

    var ApiKey = mongoose.model(Schema.api.name, Schema.api.schema);

    this.validate = function(key, callback){
        ApiKey.findById(key, function(err, apiKey){
            if(err || apiKey == null) {
                callback(new Error("API key "+key+" is invalid."));
            }else{
                callback(null, apiKey);
            }
        });
    };

    this.remove = function(req, res){
        ApiKey.remove({_id: req.key }, function(err){
            if(err) res.status(500).json({message: err.message});
            else res.json({success: true});
        });
    };

    this.get = function(req, res){
        this.validate(req.params.key, function(err, key){
            if(err) res.status(500).json({message: err.message});
            else res.json(key);
        });
    };

    this.getAll = function(req, res){
        var user = req._passport.session.user;
        ApiKey.find({ githubId: user.githubId}, function (err, keys) {
            if(err) res.status(500).json({message: err.message});
            else res.json(keys);
        });
    };

    this.getCreate =function(req, res){
        var user = req._passport.session.user;
        var apiKey = new ApiKey({githubId: user.githubId});
        apiKey.save(function(err, key){
            if(err) res.status(500).json({message: err.message});
            else res.json(key);
        });
    };
}

module.exports = ApiManager;