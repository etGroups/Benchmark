import {Client} from "https://deno.land/x/mysql/mod.ts";

const env = Deno.env.toObject();

const client = await new Client().connect({
	hostname: "db",
	username: env.MYSQL_ROOT,
	db: 'general',
	password: env.MYSQL_ROOT_PASSWORD,
	poolSize: 10
});

async function getCustomers() {
	return await client.query(`select * from CUSTOMER LIMIT 10`);
}

export {getCustomers};