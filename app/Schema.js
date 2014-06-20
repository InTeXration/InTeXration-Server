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
    buildSchema: Schema({
        blueprint: {
            owner: String,
            repo: String,
            url: String,
            pusher: String,
            message:String,
            timestamp : Date
        },
        timestamp : { type : Date, default: Date.now },
        documents: [
            {
                name: String,
                timestamp: Date,
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