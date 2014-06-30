var Schema = require('./../common/Schema');

function ApiManager(mongoose){

    var ApiKey = mongoose.model(Schema.api.name, Schema.api.schema);

    this.validate = function(key, callback){
        ApiKey.findById(key, function(err, apiKey){
            if(err || apiKey == null) {
                callback(new Error("API key ("+key+") is invalid."));
            }else{
                callback(null, apiKey);
            }
        });
    };

    this.create = function(githubId, callback){
        var apiKey = new ApiKey({githubId: githubId});
        apiKey.save(callback);
    };

    this.remove = function(key, callback){
        ApiKey.remove({_id: key }, callback);
    };

    this.get = function(req, res){
        this.validate(req.id, function(err, key){
            if(err) res.status(500).json({message: err.message});
            else res.json(key);
        })
    };

    this.getAll = function(req, res){
        ApiKey.find({ githubId: req.id}, function (err, keys) {
            if(err) res.status(500).json({message: err.message});
            else res.json(keys);
        });
    };

    this.new =function(req, res){
        var user = req.user;
        create(user.id, function(err, key){
            if(err) res.status(500).json({message: err.message});
            else res.json(key);
        });
    };
}

module.exports = ApiManager;