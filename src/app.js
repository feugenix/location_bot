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
    .setWebHook(`https://safe-inlet-1186.herokuapp.com/hook/${token}/`)
    .catch(reason => debug(`Failed to set hook. Reason: ${reason}`))
    .on('message', data => debug(data));

/*
app.post(HOOK_URL, function(req, res) {
    let message = req.body.message,
        playerLocation = message.location,
        textReply;

    if (!playerLocation) {
        textReply = 'Не понял';

        if (message.text.length > 0) {
            switch (message.text.toLowerCase()) {
                case '/help':
                    textReply = 'Абсолютный ноль (дальше 150 метров) -> Ооочень холодно (от 150 метров до 100) -> Ниже нуля (от 100 до 50 метров) -> Холодно (от 50 метров до 30) -> Тепло (от 30 метров до 15) -> Жарко (от 15 метров до 5) -> АдЪ';
                    break;

                case '/fail':
                    textReply = 'Лузер! Иди на перекрёсток Горького и Пушкина';
                    break;

                case 'бегемотобар':
                case 'бегемот':
                    textReply = 'Правильно!';
                    break;
            }
        }

        bot.sendMessage({
            chat_id: message.chat.id,
            text: textReply
        });

        res.status(200).end();
        return;
    }

    let resJSON = {
        chat_id: message.chat.id,
        text: getMessageByLocation(playerLocation)
    };

    bot.sendMessage(resJSON);

    res.status(200).end();
});
*/

let startServer = () => {
    app.listen(process.env.PORT || 55555, () => debug('Started server'));
};
