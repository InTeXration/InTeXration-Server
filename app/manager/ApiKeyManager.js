var Schema = require('./../common/Schema');

function ApiKeyManager(mongoose){

    this.validate = function(key, callback){
        var ApiKey = mongoose.model('ApiKey', Schema.apiKeySchema);
        ApiKey.findById(key, function(err, apiKey){
            if(err || apiKey == null) {
                callback(new Error("API key ("+key+") is invalid."));
            }else{
                callback(false);
            }
        });
    };

    this.create = function(owner, callback){
        var ApiKey = mongoose.model('ApiKey', apiKeySchema);
        var apiKey = new ApiKey({"user": owner});
        apiKey.save(callback);
    };

    this.remove = function(key, callback){
        var ApiKey = mongoose.model('ApiKey', apiKeySchema);
        ApiKey.remove({_id: key }, callback);
    }
}

module.exports = ApiKeyManager;