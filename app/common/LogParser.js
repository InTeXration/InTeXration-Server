var Q = require('q'),
    fs = require('fs'),
    logger = require('../common/Logger');

function LogParser(){

    var ERROR = '!';
    var WARNINGS = 'Warning';

    var find = function(lines, pattern){
        var results = [];
        var item = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(item !== '' && line === ''){
                results.push(item);
                item = '';
            }
            if(line.indexOf(pattern) > -1 || item !== ''){
                item = item.concat(line);
            }
        }
        return results;
    };

    this.parse = function(path){
        var deferred = Q.defer();
        fs.readFile(path, 'utf8', function (err,data){
            if(err){
                logger.error('Log Parser: Cannot open file', {file:path});
                deferred.resolve(err);
            }else {
                var lines = data.split("\r\n");
                var errors = find(lines, ERROR);
                var warnings = find(lines, WARNINGS);
                deferred.resolve({
                    errors: errors,
                    warnings: warnings
                });
            }
        });
        return deferred.promise;
    };
}

module.exports = LogParser;