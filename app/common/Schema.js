var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = {

    api: {
        name: 'ApiKey',
        schema: Schema({
            user: String,
            timestamp: Date
        })
    },

    user: {
        name: 'User',
        schema: Schema({
            githubId: String,
            username : String,
            displayName: String,
            email: String
        })
    },

    buildhook: {
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

    build: {
        name: 'Build',
        schema: Schema({
            buildhook: {
                owner: String,
                repo: String,
                url: String,
                pusher: String,
                message:String,
                timestamp: Date
            },
            documents: [
                {
                    name: String,
                    timestamp: Date,
                    files: [
                        {
                            ext: String,
                            name: String,
                            path: String,
                            timestamp: Date
                        }
                    ]
                }
            ]
        })
    }

};