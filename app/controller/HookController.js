var RepoBuilder = require('./../builder/RepoBuilder'),
    Schema = require('./../Schema');
    ApiKeyManager = require('./../manager/ApiKeyManager'),
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
                    var blueprint = new Blueprint({
                        "owner": data.repository.owner.name,
                        "repo": data.repository.name,
                        "url": data.repository.url,
                        "pusher": data.pusher.name,
                        "message": data.head_commit.message,
                        "timestamp": Date.now()
                    });
                    blueprint.save(function(err){
                        if(err){
                            res.status(500);
                            res.json({"message": err.message});
                        }else{
                            tmp.dir(function(err, path) {
                                if(err) console.log(err);
                                else {
                                    var repoBuilder = new RepoBuilder(blueprint, path);
                                    repoBuilder.build().then(function(b){
                                        var Build = mongoose.model('Build', Schema.buildSchema);
                                        var build = Build(b);
                                        console.log('--- Build ---');
                                        console.log(JSON.stringify(build));
                                        build.save(function(err){
                                            console.error(err);
                                        });
                                    }, console.error);
                                }
                            });
                            res.json(blueprint);
                        }
                    });
                }
            }
        });
    };
}

module.exports = HookController;