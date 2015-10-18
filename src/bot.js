let https = require('https'),
    http = require('http'),
    querystring = require('querystring'),
    EventEmitter = require('events').EventEmitter,
    debug = require('debug')('botApi');

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

/**
 * Internal web server to handle hook requests
 * @class InternalHookServer
 */
class InternalHookServer extends EventEmitter {
    start(options) {
        if (this._webServer)
            return this;

        options = options || {};

        options.port = options.port || 55555;

        if (options.key && options.cert) {
            let httpsOptions = {
                key: fs.readFileSync(options.key),
                cert: fs.readFileSync(options.cert)
            };

            this._webServer = https.createServer(httpsOptions, this::this._handleRequest);
            debug('Created HTTPS Hook Server');
        } else {
            this._webServer = http.createServer(this::this._handleRequest);
            debug('Created HTTP Hook Server');
        }

        this._webServer.listen(
            options.port,
            options.host,
            () => debug(`started server on port ${options.port}`)
        );

        return this;
    }

    _handleRequest(req, res) {
        debug(`WebHook request method: ${req.method}`);
        debug(`WebHook request URL: ${req.url}`);

        if (req.method !== 'POST') {
            debug('WebHook request isn\'t a POST');
            res.statusCode = 418;
            return res.end();
        }

        let fullBody = '';

        req
            .on('data', chunk => fullBody += chunk.toString())
            .on('end', () => {
                try {
                    let data = JSON.parse(fullBody);
                    this.emit('data', data);
                } catch (error) {
                    debug(error);
                    this.emit('error', error);
                }

                res.end('OK');
            });
    }
};
