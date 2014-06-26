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
            timestamp: Date
        })
    },

    api: {
        name: 'ApiKey',
        schema: Schema({
            user: String,
            timestamp: Date
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
                timestamp: Date
            },
            timestamp: Date,
            documents: [
                {
                    name: String,
                    timestamp: Date,
                    files: [
                        {
                            ext: String,
                            name: String,
                            path: String
                        }
                    ]
                }
            ]
        })
    }

};