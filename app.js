'use strict';

let https = require('https'),
    querystring = require('querystring'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

let toRadians = (angle) => angle * Math.PI / 180;

const BOT_TOKEN = process.env.BOT_TOKEN;
const API_HOST = 'api.telegram.org';
const API_BOT_TOKEN = `/bot${BOT_TOKEN}`;
const API_URL = `https://${API_HOST}${API_BOT_TOKEN}`;
const APP_URL = 'https://safe-inlet-1186.herokuapp.com';
const HOOK_URL = `/hook/${BOT_TOKEN}/`;
const CODE_LOCATION = (process.env.CODE_LOCATION || '')
    .split(';')
    .map((coord) => toRadians(parseFloat(coord)));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

https
    .get(`${API_URL}/setWebhook?url=${APP_URL}${HOOK_URL}`)
    .on('error', () => console.log('Cant set webhook'))
    .on('response', (response) => {
        if (response.statusCode !== 200)
            return console.log('Telegram sad no');

        console.log('hook was set');

        startServer();
    });

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

        sendMessage({
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

    sendMessage(resJSON);

    res.status(200).end();
});

function getDistanceFromCode(playerLocation) {
    let plLatitude = toRadians(parseFloat(playerLocation.latitude)),
        plLongitude = toRadians(parseFloat(playerLocation.longitude)),
        playerDistance = Math.acos(
            Math.sin(CODE_LOCATION[0]) * Math.sin(plLatitude)
            + Math.cos(CODE_LOCATION[0]) * Math.cos(plLatitude) * Math.cos(CODE_LOCATION[1] - plLongitude)
            ) * 6369000;

    return playerDistance;
}

function getMessageByLocation(playerLocation) {
    let playerDistance = getDistanceFromCode(playerLocation);

    if (playerDistance <= 5) {
        return 'АдЪ, введи название заведения';
    } else if (playerDistance <= 15) {
        return 'Жарко';
    } else if (playerDistance <= 30) {
        return 'Тепло';
    } else if (playerDistance <= 50) {
        return 'Холодно';
    } else if (playerDistance <= 100) {
        return 'Ниже нуля';
    } else if (playerDistance <= 150) {
        return 'Ооочень холодно';
    } else {
        return 'Абсолютный ноль, ищи где-то в центре';
    }
}

function sendMessage(message) {
    let httpsReq = https.request({
        hostname: API_HOST,
        path: `${API_BOT_TOKEN}/sendMessage`,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    httpsReq.end(querystring.stringify(message));
}

function startServer() {
    app.listen(process.env.PORT || 55555, () => console.log('Started'));
}
