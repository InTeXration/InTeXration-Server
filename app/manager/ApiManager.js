var Schema = require('./../common/Schema');

function ApiManager(mongoose){

    var ApiKey = mongoose.model(Schema.api.name, Schema.api.schema);

    this.validate = function(key, callback){
        ApiKey.findById(key, function(err, apiKey){
            if(err || apiKey == null) {
                callback(new Error("API key ("+key+") is invalid."));
            }else{
                callback(null);
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

module.exports = ApiManager;