var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = {
    hookName: 'Hook',
    hookSchema: Schema({
        owner: String,
        repo: String,
        url: String,
        pusher: String,
        message:String,
        timestamp : { type : Date, default: Date.now }
    }),

    apiKeyName: 'ApiKey',
    apiKeySchema: Schema({
        user: String
    }),

    buildName: 'Build',
    buildSchema: Schema({
        hook: {
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
                        path: String
                    }
                ]
            }
        ]
    })
};