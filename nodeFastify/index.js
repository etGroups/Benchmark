import fastifyFramework from "fastify";
import fastify_websocket from "@fastify/websocket";
import fastify_cors from "@fastify/cors";
import CustomerResource from "./resources/customers.js";

const fastify = fastifyFramework()
fastify.register(fastify_websocket)
fastify.register(fastify_cors, {
	// put your options here
})

fastify.get('/*', {websocket: true}, (con /* SocketStream */, req /* FastifyRequest */) => {
	con.socket.on('message', async message => {
		switch (message.toString()) {
			case "HelloWS":
				con.socket.send("Hello World");
				break;
			case "SqlWS":
				const customerResource = new CustomerResource();
				const customers = await customerResource.getCustomers();
				con.socket.send(JSON.stringify(customers));
				break;
			default:
				con.socket.send(message.toString());
		}
	})
})

fastify.get('/HelloHTTP', async (req, res) => {
	return 'Hello World'
})

fastify.post('/PongHTTP', async (req, res) => {
	return req.body;
})

fastify.get('/SqlHTTP', async (req, res) => {
	const customerResource = new CustomerResource();
	const customers = await customerResource.getCustomers();
	return JSON.stringify(customers);
})

const start = async () => {
	try {
		await fastify.listen(80, '0.0.0.0');
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}
start();
