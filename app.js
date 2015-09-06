"use strict";
var https = reqiure('https'),
    express = require('express'),
    app = express();

const URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/`;
const HOOK_URL = 'https://example.com';
const LOCATION = process.env.LOCATION;

https
    .get(`${URL}/setWebhook/url=${HOOK_URL}`)
    .on('error', () => console.log('Cant set webhook'))
    .on('response', function (response) {
        if (response.statusCode !== 200)
            return console.log('Telegram sad no');

        startServer();
    });

function startServer() {
    app.listen(process.env.PORT || 55555, () => console.log('Started'));
};
