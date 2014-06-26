var express = require('express');
var router = express.Router();

router.getByRepo('*', function(req, res){
    res.render('index.html');
});

module.exports = router;