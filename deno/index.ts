import {urlParse} from "https://deno.land/x/url_parse/mod.ts";
import {serve} from "https://deno.land/std@0.118.0/http/server.ts";

function isJson(str: string) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return false;
	}
}

function route(req: Request) {
	const server = urlParse(req.url);
	switch (server.pathname) {
		case '/HelloHTTP': {
			return new Response('Hello World', {status: 200});
		}
		case '/PongHTTP': {
			return new Response('Hello Pong', {status: 200});
		}
		case '/SqlHTTP': {
			return new Response('Hello Sql', {status: 200});
		}
		default: {
			return new Response('Hello deno', {status: 200});
		}
	}
}

async function wsRoute(socket: WebSocket, socketRequest: MessageEvent) {
	const data = isJson(socketRequest.data);
	if (!data || !data.method) {
		socket.send("Data must be a valid JSON");
		return false;
	}
	switch (data.method) {
		case '/HelloWS': {
			socket.send("Hello world");
			break;
		}
		case '/PongWS': {
			socket.send("Hello Pong");
			break;
		}
		case '/SqlWS': {
			socket.send("Hello Sql");
			break;
		}
		default: {
			socket.send("Hello deno");
			break;
		}
	}
}

const handler = async (req: Request): Promise<Response> => {
	const isWS = req.headers.get('upgrade') === 'websocket';

	if (isWS) {
		const {socket, response} = Deno.upgradeWebSocket(req);
		socket.onopen = () => {
			console.log('WebSocket connection opened')
		};
		socket.onmessage = (socketRequest) => {
			wsRoute(socket, socketRequest);
		};
		socket.onclose = () => console.log("WebSocket has been closed.");
		socket.onerror = (e) => console.error("WebSocket error:", e);
		return response;
	} else {
		return route(req);
	}
};

await serve(await handler, {port: 80});