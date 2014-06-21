var RepoBuilder = require('./../builder/RepoBuilder'),
    Schema = require('./../Schema'),
    ApiKeyManager = require('./../manager/ApiKeyManager'),
    logger = require('../Logger'),
    tmp = require('tmp');

    function HookController(mongoose){

    var mongoose = mongoose;
    var apiKeyManager = new ApiKeyManager(mongoose);

    this.post = function (req, res, next) {
        var data = req.body;
        apiKeyManager.validate(req.params.key, function(err){
            if(err){
                res.status(401);
                res.json({"message": err.message});
            }else{
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
                        if(err){
                            logger.error('HookController: Unable to store blueprint', {error: err});
                            res.status(500).json({"message": err.message});
                        }else{
                            tmp.dir(function(err, path) {
                                if(err){
                                    logger.error('HookController: Unable to create temp dir', {error: err});
                                    res.status(500).json({"message": err.message});
                                }
                                else {
                                    var repoBuilder = new RepoBuilder(bp, path);
                                    repoBuilder.build().then(function(b){
                                        var Build = mongoose.model('Build', Schema.buildSchema);
                                        var build = Build(b);
                                        build.save(function(err){
                                            logger.error('HookController: Unable to store build', {error: err});
                                        });
                                        res.json(b);
                                    }, function(err){
                                        logger.error('HookController: Unable to build repository', {error: err});
                                        res.status(500).json({"message": err.message});
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    };
}

module.exports = HookController;