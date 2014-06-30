var _ = require('underscore'),
    p = require('path'),
    fs = require('fs'),
    mail = require("nodemailer").mail,
    logger = require('../common/Logger'),
    CONFIG = require('config');

function MailManager(){

    this.send = function(to, subject, template, data){
        var templatePath = p.join(p.dirname(require.main.filename), template);
        var templateFile = fs.readFileSync(templatePath).toString();
        var html = _.template(templateFile, data);
        var from = CONFIG.mail.sender;
        var options = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };
        mail(options, function(err){
            if(err) logger.error("MailManager: Error", {error: err});
            else logger.debug("MailManager: Mail Sent", {mail: options});
        });
    };

    this.signup = function(name, email){
        this.send(email, 'Welcome!', 'signup.html', {name: name});
    };
}

module.exports = MailManager;