import TelegramBot from './bot';
import {toRadians} from './helpers';

export default class LocationBot extends TelegramBot {
    constructor(params) {
        super(params);

        this.codeLocation = (params.codeLocation || '')
            .split(';')
            .map(coord => toRadians(parseFloat(coord)));
    }
};

let getMessageByLocation = (playerLocation, codeLocaton) => {
    let playerDistance = getDistanceFromCode(playerLocation, codeLocaton);

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
};

// TODO: implement logic below
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
