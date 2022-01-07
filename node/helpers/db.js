import mysql from 'mysql2/promise';

const dbGeneral = mysql.createPool({
	host: 'db',
	user: process.env.MYSQL_ROOT,
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: 'general',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

class DB {
	constructor(database, config = {}) {
        this.pool = dbGeneral
	}
}

const db = new DB();
export default db;