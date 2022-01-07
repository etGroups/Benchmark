import uWS from 'uWebSockets.js';
import {execCommand} from './helpers/functions.js';
import Authentication from "./helpers/authentication.js";
import jwt from "jsonwebtoken";

const host = '0.0.0.0';
const port = 80;

let hostname;
let wsKey;

function authMiddleware(res, req, routeMethod) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');

	res.onAborted(() => {
		res.writeStatus('408 Request Timeout');
		res.end('Something went wrong');
	});

	const token = req.getHeader('authorization')?.split(' ')[1];
	if (!token) {
		res.writeStatus('401 Unauthorized');
		res.end('token is invalid');
		return false;
	}

	jwt.verify(token, process.env.JWT_SECRET_KEY, (error, data) => {
		if (error) {
			res.writeStatus('403 Forbidden');
			res.end('token is invalid');
			return false;
		}

		req.user = data;
		routeMethod(res, req);
	});
}

const requestListener = {
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
	message: (ws, message, isBinary) => {
		const buffer = Buffer.from(message);
		const request = JSON.parse(buffer.toString());
		let ok = ws.send(message, isBinary);

		execCommand(request);
	}
};

function cors(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Methods', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');
	res.writeStatus('204 No Content')
	res.end();
}

async function login(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');

	res.onAborted(() => {
		res.writeStatus('408 Request Timeout');
		res.end('Something went wrong');
	});

	let token = req.getHeader('authorization');

	if (token !== '' && token !== 'Basic ') {
		const authentication = new Authentication(req.getHeader('host'));
		const [email, password] = authentication.decodeBasic(token);
		const user = await authentication.login(email, password);
		if (typeof user === 'string') {
			res.writeStatus('401 Unauthorized');
			res.end(user);
			return;
		}
		token = authentication.generateToken(user);
	} else {
		res.writeStatus('401 Unauthorized');
		res.end('Incorrect login details');
		return;
	}

	res.writeStatus('200 OK');
	res.end(token);
}

function testToken(res, req) {
	res.writeStatus('200 OK');
	res.end('Your token is valid');
}

async function userTokens(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');

	res.onAborted(() => {
		res.writeStatus('408 Request Timeout');
		res.end('Something went wrong');
	});

	let tokens;
	const token = req.getHeader('authorization');

	if (token !== '' && token !== 'Basic ') {
		const authentication = new Authentication(req.getHeader('host'));
		const [email, password] = authentication.decodeBasic(token);
		const user = await authentication.login(email, password)
		if (typeof user === 'string') {
			res.writeStatus('401 Unauthorized');
			res.end(user);
			return;
		}
		tokens = await authentication.addToken(user, idService);
	} else {
		res.writeStatus('401 Unauthorized');
		res.end('Incorrect login details');
		return;
	}

	res.writeStatus('200 OK');
	res.end(tokens);
}

async function addToken(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');

	res.onAborted(() => {
		res.writeStatus('408 Request Timeout');
		res.end('Something went wrong');
	});

	let newToken;
	const token = req.getHeader('authorization');
	const idService = req.getHeader('id-service');

	if (token !== '' && token !== 'Basic ') {
		const authentication = new Authentication(req.getHeader('host'));
		const [email, password] = authentication.decodeBasic(token);
		const user = await authentication.login(email, password)
		if (typeof user === 'string') {
			res.writeStatus('401 Unauthorized');
			res.end(user);
			return;
		}
		newToken = await authentication.addToken(user, idService);
	} else {
		res.writeStatus('401 Unauthorized');
		res.end('Incorrect login details');
		return;
	}

	res.writeStatus('200 OK');
	res.end(newToken);
}

async function refreshToken(res, req) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader('Access-Control-Allow-Headers', '*');

	res.onAborted(() => {
		res.writeStatus('408 Request Timeout');
		res.end('Something went wrong');
	});

	let newToken;
	const token = req.getHeader('authorization');
	const oldToken = req.getHeader('token');

	if (token !== '' && token !== 'Basic ') {
		const authentication = new Authentication(req.getHeader('host'));
		const [email, password] = authentication.decodeBasic(token);
		const user = await authentication.login(email, password)
		if (typeof user === 'string') {
			res.writeStatus('401 Unauthorized');
			res.end(user);
			return;
		}
		newToken = await authentication.refreshToken(user, oldToken);
	} else {
		res.writeStatus('401 Unauthorized');
		res.end('Incorrect login details');
		return;
	}

	res.writeStatus('200 OK');
	res.end(newToken);
}

const server = uWS.App({})
	.ws('/*', requestListener)
	.get('/login', async (res, req) => {
		await login(res, req)
	})
	.get('/myTokens', (res, req) => {
		userTokens(res, req)
	})
	.get('/addToken', (res, req) => {
		addToken(res, req)
	})
	.get('/refreshToken', (res, req) => {
		refreshToken(res, req)
	})
	.get('/testToken', (res, req) => {
		authMiddleware(res, req, testToken);
	})
	.options('/*', (res, req) => {
		cors(res, req)
	});
server.listen(host, port, () => {
	console.log(`Server is running on ws://${host}:${port}`);
})