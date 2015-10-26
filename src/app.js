/*eslint strict: [0, "never"]*/
'use strict';

import DebugFactory from 'debug';
import { toRadians, getDistanceFromCode } from './helpers';
import LocationBot from './locationBot';

let debug = DebugFactory('botApi-test'),
    token = process.env.BOT_TOKEN;

let bot = new LocationBot({
    token,
    codeLocation: process.env.CODE_LOCATION
});

bot
    .setWebHook({
        hookUrl: `https://safe-inlet-1186.herokuapp.com/hook/${token}/`,
        serverOptions: {
            port: 55555
        }
    })
    .catch(reason => debug(`Failed to set hook. Reason: ${reason}`));

bot.on('message', data => debug(data));
