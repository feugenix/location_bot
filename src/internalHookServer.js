import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import {EventEmitter} from 'events';
import DebugFactory from 'debug';

let debug = DebugFactory('botApi');

/**
 * Internal web server to handle hook requests
 * @class InternalHookServer
 */
export default class InternalHookServer extends EventEmitter {
    /**
     * Starts https server, if cert and key are aviable. Otherwise falls to http
     * Only one server per instance is allowed.
     *
     * @param {Object} options
     * @param {Object} [options.port=55555]
     * @param {Object} [options.host]
     * @param {Object} [options.key]
     * @param {Object} [options.cert]
     *
     * @returns {InternalHookServer}
     */
    start(options) {
        if (this._webServer)
            return this;

        options = options || {};

        options.port = options.port || 55555;

        if (options.key && options.cert) {
            this._webServer = this._createHttpsServer(options);
        } else {
            this._webServer = this._createHttpServer();
        }

        this._webServer.listen(
            options.port,
            options.host,
            () => debug(`started server on port ${options.port}`)
        );

        return this;
    }

    _createHttpsServer(options) {
        let httpsOptions = {
                key: fs.readFileSync(options.key),
                cert: fs.readFileSync(options.cert)
            },
            webServer;

        webServer = https.createServer(httpsOptions, this::this._handleRequest);
        debug('Created HTTPS Hook Server');

        return webServer;
    }

    _createHttpServer() {
        let webServer = http.createServer(this::this._handleRequest);
        debug('Created HTTP Hook Server');

        return webServer;
    }

    /**
     * Stops hook server
     *
     * @returns {InternalHookServer}
     */
    stop() {
        if (!this._webServer)
            return this;

        this._webServer.close();

        this._webServer = null;

        return this;
    }

    /**
     * Handles request to webhook
     * @private
     *
     * @param {Object} req
     * @param {Object} res
     */
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
