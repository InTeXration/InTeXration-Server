var Q = require('q'),
    fs = require('fs'),
    logger = require('../common/Logger');

function LogParser(){

    var ERROR = '!';
    var WARNINGS = 'Warning';
    var NEWLINE = '\n'

    var find = function(lines, pattern, replace){
        var results = [];
        var item = '';
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if(item !== '' && line === ''){
                if(replace) item = item.replace(pattern, '');
                results.push(item);
                item = '';
            }
            if(line.indexOf(pattern) > -1 || item !== ''){
                item = item.concat(line.concat(NEWLINE));
            }
        }
        return results;
    };

    this.parse = function(path){
        var deferred = Q.defer();
        fs.readFile(path, function (err, data){
            if(err){
                logger.error('Log Parser: Cannot open file', {file:path});
                deferred.reject(err);
            }else {
                var lines = data.toString().split(NEWLINE);
                var errors = find(lines, ERROR, true);
                var warnings = find(lines, WARNINGS, false);
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