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
                    var Build = mongoose.model('Build', Schema.buildSchema);
                    var build = new Build({
                        "owner": data.repository.owner.name,
                        "repo": data.repository.name,
                        "url": data.repository.url,
                        "pusher": data.pusher.name,
                        "message": data.head_commit.message,
                        "timestamp": Date.now()
                    });
                    build.save(function(err){
                        if(err){
                            res.status(500);
                            res.json({"message": err.message});
                        }else{
                            tmp.dir(function(err, path) {
                                if(err) console.log(err);
                                else {
                                    var repoBuilder = new RepoBuilder(build, path);
                                    repoBuilder.build().then(function(doc){
                                        var Document = mongoose.model('Document', Schema.documentSchema);
                                        var document = Document(doc);
                                        document.save(function(err){
                                            console.error(err);
                                        });
                                    }, console.error);
                                }
                            });
                            res.json(build);
                        }
                    });
                }
            }
        });
    };
}

module.exports = HookController;