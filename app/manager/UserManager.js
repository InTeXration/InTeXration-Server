var Schema = require('./../common/Schema'),
    MailManager = require('./MailManager'),
    logger = require('../common/Logger');

function UserManager(mongoose){

    var User = mongoose.model(Schema.user.name, Schema.user.schema);
    var mailManager = new MailManager();

    this.findOrCreate = function(profile, callback){
        var id = mongoose.Types.ObjectId(profile.id);
        User.findById(id, function(err, user){
            if(err){
                callback(err);
            }else if(user !== null){
                callback(null, user);
            }else{
                logger.debug("UserManager: New User %s", profile.username);
                var user = new User({
                    _id: id,
                    username: profile.username,
                    displayName: profile.displayName,
                    email: profile.emails[0].value
                });
                user.save(function(err, user){
                    mailManager.signup(user.displayName, user.email);
                    callback(err, user);
                });
            }
        });
    }
}

module.exports = UserManager;