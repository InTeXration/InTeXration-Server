var RepoBuilder = require('./../builder/RepoBuilder'),
    Schema = require('./../common/Schema'),
    logger = require('../common/Logger'),
    tmp = require('tmp');

    function HookController(mongoose, apiController){

    var Hook = mongoose.model(Schema.buildhook.name, Schema.buildhook.schema);
    var Build = mongoose.model(Schema.build.name, Schema.build.schema);

        var buildRepo = function(hook){
        tmp.dir({prefix: 'intexration_'}, function(err, path) {
            if(err) logger.error('HookController: %s', 'Unable to create temp dir', {error: err});
            else {
                var repoBuilder = new RepoBuilder(hook, path);
                repoBuilder.build().then(function(b){
                    try{
                        Build.create(b, function(err, build){
                            if(err) logger.error('HookController: %s', 'Unable to create build', {error: err});
                            else logger.debug('HookController: %s', 'Build stored', {build: b});
                        });
                    }catch (e){
                        logger.error(e);
                        console.log(e.stack);
                    }
                }, function(err){
                    if(err) logger.error('HookController: %s', 'Unable to build repository', {error: err});
                });
            }
        });
    };

    this.post = function (req, res) {
        var data = req.body;
        apiController.validate(req.params.key, function(err){
            if(err) {
                res.status(401).json({message: 'Invalid API Key'});
            }
            else{
                if(data.hasOwnProperty('zen')){
                    res.json({message: 'WebHook Setup Successful'});
                }else{
                    var hk = {
                        owner: data.repository.owner.name,
                        repo: data.repository.name,
                        url: data.repository.url,
                        pusher: data.pusher.name,
                        message: data.head_commit.message,
                        timestamp: Date.now()
                    };
                    var hook = new Hook(hk);
                    Hook.create(hk, function(err, hook){
                        if(err) {
                            logger.error('HookController: %s', 'Unable to create hook', {error: err});
                            res.status(500).json({message: 'Unable to store hook'});
                        }else{
                            res.json(hk);
                            buildRepo(hk, res);
                        }
                    });
                }
            }
        });
    };

    this.getAll = function (req, res) {
        Hook.find({}, function(err, hooks){
            res.json(hooks);
        });
    };

    this.getByRepo = function (req, res) {
        Hook.find({"owner": req.params.owner, "repo": req.params.repo}, function(err, hooks){
            res.json(hooks);
        });
    }
}

module.exports = HookController;