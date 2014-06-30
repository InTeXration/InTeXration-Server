var Schema = require('./../common/Schema'),
    MailController = require('./MailController'),
    logger = require('../common/Logger');

function UserController(mongoose){

    var User = mongoose.model(Schema.user.name, Schema.user.schema);
    var mailController = new MailController();

    this.get =function(req, res){
        var user = req._passport.session.user;
        User.findOne({githubId: user.githubId}, function(err, user){
            if(err) res.status(500).json({message: err.message});
            else res.json(user);
        });
    };

    this.findOrCreate = function(profile, callback){
        User.findOne({githubId: profile.id}, function(err, user){
            if(err){
                callback(err);
            }else if(user !== null){
                callback(null, user);
            }else{
                logger.debug("UserController: New User %s", profile.username);
                var user = new User({
                    githubId: profile.id,
                    username: profile.username,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.json.avatar_url
                });
                user.save(function(err, user){
                    mailController.signup(user.displayName, user.email);
                    callback(err, user);
                });
            }
        });
    }
}

module.exports = UserController;