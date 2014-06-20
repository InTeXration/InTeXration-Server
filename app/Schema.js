var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = {
    blueprintSchema: Schema({
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
        files: [
            {
                type: { type: String },
                name: String,
                dir: String
            }
        ]
    }),
    buildSchema: Schema({
        blueprint: {
            owner: String,
            repo: String,
            url: String,
            pusher: String,
            message:String,
            timestamp : { type : Date, default: Date.now }
        },
        timestamp : { type : Date, default: Date.now },
        documents: [
            {
                name: String,
                timestamp: { type: Date, default: Date.now },
                files: [
                    {
                        type: { type: String },
                        name: String,
                        dir: String
                    }
                ]
            }
        ]
    })
};