import * as https from 'https';
import * as querystring from 'querystring';
import {EventEmitter} from 'events';
import DebugFactory from 'debug';
import InternalHookServer from './internalHookServer';

let debug = DebugFactory('botApi');

/**
 * Creates a instance of bot with es7 syntax
 * @class TelegramBot
 */
export default class TelegramBot extends EventEmitter {
    /**
     * @constructor
     *
     * @param {String} token — bot token
     * @param {String} [apiHost='api.telegram.org']
     */
    constructor({ token, apiHost = 'api.telegram.org' }) {
        super();

        this.token = token;
        this.apiHost = apiHost;

        this.botToken = `/bot${this.token}`;
        this.apiURL = `https://${this.apiHost}${this.botToken}`;
    }

    /**
     * Sets web hook and starts server for handing requests to hook
     *
     * @param {String} hookUrl
     * @param {Object} [serverOptions]
     * @param {Number} [serverOptions.port=55555]
     * @param {String} [serverOptions.key] — path to file with key
     * @param {String} [serverOptions.cert] — path to file with cert
     *
     * @returns {TelegramBot}
     */
    setWebHook({ hookUrl, serverOptions }) {
        let executor = (resolve, reject) => {
                https
                    .get(`${this.apiURL}/setWebhook?url=${hookUrl}`)
                    .on('error', () => reject('Cannot run https request.'))
                    .on('response', response => {
                        if (response.statusCode !== 200)
                            return reject('WebHook was rejected by Telegram.');

                        (new InternalHookServer)
                            .start(serverOptions)
                            .on('data', data => this.emit('message', data))

                        resolve();
                    });
            },
            promise = new Promise(executor);

        return promise;
    }

    /**
     * Sends message from bot
     *
     * @param {Object} message
     */
    sendMessage(message) {
        let httpsReq = https.request({
                hostname: this.apiHost,
                path: `${this.botToken}/sendMessage`,
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        httpsReq.end(querystring.stringify(message));
    }
};
