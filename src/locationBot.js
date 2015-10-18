import TelegramBot from './bot';
import {toRadians} from './helpers';

export default class LocationBot extends TelegramBot {
    constructor(params) {
        super(params);

        this.codeLocation = (params.codeLocation || '')
            .split(';')
            .map(coord => toRadians(parseFloat(coord)));
    }
}

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
