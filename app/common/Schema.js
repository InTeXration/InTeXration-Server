var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = {

    hook: {
        name: 'Hook',
        schema: Schema({
            owner: String,
            repo: String,
            url: String,
            pusher: String,
            message:String,
            timestamp : { type : Date, default: Date.now }
        })
    },

    api: {
        name: 'ApiKey',
        schema: Schema({
            user: String,
            timestamp: { type : Date, default: Date.now }
        })
    },

    build: {
        name: 'Build',
        schema: Schema({
            hook: {
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
                    timestamp: { type : Date, default: Date.now },
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
    }

};