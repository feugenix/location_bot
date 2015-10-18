/*eslint strict: [0, "never"]*/
'use strict';

import { toRadians, getDistanceFromCode } from './helpers';
import LocationBot from './locationBot';

let debug = require('debug')('botApi-test'),
    https = require('https'),
    querystring = require('querystring'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    token = process.env.BOT_TOKEN;

let bot = new LocationBot({
    token,
    codeLocation: process.env.CODE_LOCATION
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

bot
    .setWebHook({
        hookUrl: `https://safe-inlet-1186.herokuapp.com/hook/${token}/`,
        serverOptions: {
            port: 55555
        }
    })
    .catch(reason => debug(`Failed to set hook. Reason: ${reason}`));

bot.on('message', data => debug(data));

let startServer = () => {
    app.listen(process.env.PORT || 55555, () => debug('Started server'));
};
