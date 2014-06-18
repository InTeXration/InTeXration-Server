var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = {
    buildSchema: Schema({
        owner: String,
        repo: String,
        url: String,
        pusher: String,
        message:String,
        timestamp : { type : Date, default: Date.now }
    }),
    apiKeySchema: Schema({
        user: String
    }),
    documentSchema: Schema({
        name: String,
        timestamp: { type : Date, default: Date.now },
        build: {
            owner: String,
            repo: String,
            url: String,
            pusher: String,
            message: String,
            timestamp: Date
        },
        files: [{
            type: String,
            name: String,
            dir: String
        }]
    })
};