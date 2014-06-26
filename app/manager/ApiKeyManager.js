var Schema = require('./../common/Schema');

function ApiKeyManager(mongoose){

    var ApiKey = mongoose.model(Schema.apiKeyName, Schema.apiKeySchema);

    this.validate = function(key, callback){
        ApiKey.findById(key, function(err, apiKey){
            if(err || apiKey == null) {
                callback(new Error("API key ("+key+") is invalid."));
            }else{
                callback(false);
            }
        });
    };

    this.create = function(owner, callback){
        var apiKey = new ApiKey({"user": owner});
        apiKey.save(callback);
    };

    this.remove = function(key, callback){
        ApiKey.remove({_id: key }, callback);
    }
}

module.exports = ApiKeyManager;