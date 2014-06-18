mongoose = require('mongoose');

module.exports = {
    buildSchema: mongoose.Schema({
        owner: String,
        repo: String,
        url: String,
        pusher: String,
        message:String,
        timestamp : { type : Date, default: Date.now }
    }),
    apiKeySchema: mongoose.Schema({
        user: String
    }),
    documentSchema: mongoose.Schema({
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
            url: String
        }]
    })
};