var express = require('express'),
    HookController = require('./HookController');
var router = express.Router();

router.post('/:key', function(req, res, next) {
    HookController.post(req, res, next);
});

module.exports = router;