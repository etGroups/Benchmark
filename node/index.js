import uWS from 'uWebSockets.js';
import TestResource from './resources/test.js';

const host = '0.0.0.0';
const port = 80;

let hostname;
let wsKey;

function readJson(res, cb, err) {
    res.onData((ab, isLast) => {
        let chunk = Buffer.from(ab);
        cb(chunk);
    });

    res.onAborted(err);
}

function cors(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Methods', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');
	res.writeStatus('204 No Content')
	res.end();
}

const ws = {
    upgrade: (res, req, context) => {
        hostname = req.getHeader('host');
        wsKey = req.getHeader('sec-websocket-key');

        res.upgrade(
            {url: req.getUrl()},
            wsKey,
            req.getHeader('sec-websocket-protocol'),
            req.getHeader('sec-websocket-extensions'),
            context
        );
    },
    message: async (ws, message, isBinary) => {
        const buffer = Buffer.from(message);
        const request = buffer.toString();
        switch (request) {
            case "HelloWS":
                ws.send("Hello World");
                break;
            case "SqlWS":
                const testResource = new TestResource();
                const customers = await testResource.getCustomers();
                ws.send(JSON.stringify(customers));
                break;
            default:
                ws.send(request);
        }
    }
};

const server = uWS.App({})
	.ws('/*', ws)
    .get('/HelloHTTP', (res, req) => {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader('Access-Control-Allow-Headers', '*');
        res.writeStatus('200 OK');
        res.end("Hello World");
    })
    .post('/PongHTTP', (res, req) => {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader('Access-Control-Allow-Headers', '*');

        readJson(res, (obj) => {
            res.end(obj);
        }, () => {
            console.log('Invalid JSON or no data at all!');
        });
    })
    .get('/SqlHTTP', async (res, req) => {
        res.writeHeader('Access-Control-Allow-Origin', '*');
        res.writeHeader('Access-Control-Allow-Headers', '*');

        res.onAborted(() => {
            res.writeStatus('408 Request Timeout');
            res.end('Something went wrong');
        });

        res.writeStatus('200 OK');
        const testResource = new TestResource();
        const customers = await testResource.getCustomers();
        res.end(JSON.stringify(customers));
    })
	.options('/*', (res, req) => {
		cors(res, req)
	});
server.listen(host, port, () => {
	console.log(`Server is running on ws://${host}:${port}`);
})