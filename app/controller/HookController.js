var RepoBuilder = require('./../builder/RepoBuilder'),
    Schema = require('./../common/Schema'),
    ApiKeyManager = require('./../manager/ApiKeyManager'),
    logger = require('../common/Logger'),
    tmp = require('tmp');

    function HookController(mongoose){

    var apiKeyManager = new ApiKeyManager(mongoose);

    var abort = function(code, message, err, res){
        if(err){
            logger.error('HookController: %s', message, {error: err});
            res.status(code).json({"message": message});
        }
    };

    var buildRepo = function(hook, res){
        tmp.dir({prefix: 'intexration-'}, function(err, path) {
            if(err) abort('Unable to create temp dir', 500, err, res);
            else {
                var repoBuilder = new RepoBuilder(hook, path);
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
                if(data.hasOwnProperty('zen')){
                    res.json({"message": "WebHook Setup Successful"});
                }else{
                    var Hook = mongoose.model('Hook', Schema.hookSchema);
                    var hk = {
                        "owner": data.repository.owner.name,
                        "repo": data.repository.name,
                        "url": data.repository.url,
                        "pusher": data.pusher.name,
                        "message": data.head_commit.message,
                        "timestamp": Date.now()
                    };
                    var hook = new Hook(hk);
                    hook.save(function(err){
                        if(err) abort('Unable to store hook', 500, err, res);
                        else{
                            buildRepo(hk, res);
                        }
                    });
                }
            }
        });
    };

    this.getAll = function (req, res) {
        var Hook = mongoose.model('Hook', Schema.hookSchema);
        Hook.find({}, function(err, hooks){
            res.json(hooks);
        });
    };

    this.get = function (req, res) {
        var Hook = mongoose.model('Hook', Schema.hookSchema);
        Hook.find({"owner": req.params.owner, "repo": req.params.repo}, function(err, hooks){
            res.json(hooks);
        });
    }
}

module.exports = HookController;