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
        })
    },

    api: {
        name: 'ApiKey',
        schema: Schema({
            user: String
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
            },
            documents: [
                {
                    name: String,
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