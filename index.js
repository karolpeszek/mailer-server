const express = require('express');
const http = require('http');
const app = express();
const formidable = require('formidable');
const util = require('util');
const nodemailer = require("nodemailer")

const port = 2137;


//app.use(express.urlencoded());

var server = http.createServer(app).listen(port, function () {
    console.log("Express server listening on port " + port);
});

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm(),
        files = [],
        fields = new Map();
    //form.multiples = true;


    form
        .on('field', function (field, value) {
            fields.set(field, value);
        })
        .on('file', function (field, file) {
            files.push(file);
        })
        .parse(req, async function () {
            let transporter;
            if (fields.get('options') == 'default')
                transporter = nodemailer.createTransport({
                    host: "in-v3.mailjet.com",
                    port: 587,
                    secure: false,
                    auth: require('./smtp-cred.json')
        
        
                });
            else
                transporter = nodemailer.createTransport({
                    host: fields.get('smtpAddress'),
                    port: fields.get('smtpPort'),
                    secure: false,
                    auth: {
                        user: fields.get('smtpUser'),
                        pass: fields.get('smtpPass')
                    }
                });
            let message = {
                from: fields.get('options') == 'default' ? '"Mailer 📨" <mailer@karol.gay>' : fields.get('from'),
                to: fields.get('to'),
                subject: fields.get('subject'),
                text: fields.get('text'),
                attachments: []
            };
            console.log(files);
            files.forEach(element => {
                if (element.originalFilename != '')
                    message.attachments.push({
                        filename: element.originalFilename,
                        path: element.filepath
                    });
            });
        
            try {
                await transporter.sendMail(message);
                res.redirect('/sent.html?error=0');
        
            } catch (ex) {
                res.redirect('/sent.html?error=1&details=' + encodeURIComponent(ex));
            }
            res.end();
        
        
        });




});
