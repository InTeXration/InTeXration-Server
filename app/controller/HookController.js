var RepoBuilder = require('./../builder/RepoBuilder'),
    Schema = require('./../Schema'),
    ApiKeyManager = require('./../manager/ApiKeyManager'),
    logger = require('../Logger'),
    tmp = require('tmp');

    function HookController(mongoose){

    var mongoose = mongoose;
    var apiKeyManager = new ApiKeyManager(mongoose);

    var abort = function(code, message, err, res){
        if(err){
            logger.error('HookController: %s', message, {error: err});
            res.status(code).json({"message": message});
        }
    };

    var buildRepo = function(blueprint, res){
        tmp.dir(function(err, path) {
            if(err) abort('Unable to create temp dir', 500, err, res);
            else {
                var repoBuilder = new RepoBuilder(blueprint, path);
                repoBuilder.build().then(function(b){
                    var Build = mongoose.model('Build', Schema.buildSchema);
                    var build = Build(b);
                    build.save(function(err){
                        if(err) abort('Unable to store build', 500, err, res);
                        else {
                            // TODO: Do not return paths!
                            res.json(b);
                        }
                    });
                }, function(err){
                    if(err) abort('Unable to build repository', 500, err, res);
                });
            }
        });
    };

    this.post = function (req, res) {
        var data = req.body;
        apiKeyManager.validate(req.params.key, function(err){
            if(err) abort('Invalid API Key', 401, err, res);
            else{
                if(data.zen){
                    res.json({"message": "WebHook Setup Successful"});
                }else{
                    var Blueprint = mongoose.model('Blueprint', Schema.blueprintSchema);
                    var bp = {
                        "owner": data.repository.owner.name,
                        "repo": data.repository.name,
                        "url": data.repository.url,
                        "pusher": data.pusher.name,
                        "message": data.head_commit.message,
                        "timestamp": Date.now()
                    };
                    var blueprint = new Blueprint(bp);
                    blueprint.save(function(err){
                        if(err) abort('Unable to store blueprint', 500, err, res);
                        else{
                            buildRepo(bp, res);
                        }
                    });
                }
            }
        });
    };
}

module.exports = HookController;