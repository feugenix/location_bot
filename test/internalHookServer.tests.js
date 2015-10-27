import * as assert from 'assert';
import * as sinon from 'sinon';

import InternalHookServer from '../lib/internalHookServer';

describe('Internal Hook Server', () => {
    let options,
        listen = () => 1;

    beforeEach(() => {
        options = {
            port: 12345
        };
    });

    describe('#start', () => {
        it('should create https server when cert and key are provided', () => {
            options.cert = 'test cert';
            options.key = 'test key';

            let hookServer = new InternalHookServer,
                createHttpsServerStub;

            createHttpsServerStub = sinon.stub(hookServer, '_createHttpsServer');
            createHttpsServerStub.returns({ listen });

            hookServer.start(options);

            assert.ok(createHttpsServerStub.calledOnce);
        });

        it('should fall to http when no cert and key are provided', () => {
            let hookServer = new InternalHookServer,
                createHttpServerStub;

            createHttpServerStub = sinon.stub(hookServer, '_createHttpServer');
            createHttpServerStub.returns({ listen });

            hookServer.start(options);

            assert.ok(createHttpServerStub.calledOnce);
        });
    });
});
