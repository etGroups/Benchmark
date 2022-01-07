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

const dbWholesalersGeneral = mysql.createPool({
	host: 'db',
	user: process.env.MYSQL_ROOT,
	password: process.env.MYSQL_ROOT_PASSWORD,
	database: 'wholesalers_general',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

const usersPool = mysql.createPool({
	host: 'db',
	user: process.env.MYSQL_ROOT,
	password: process.env.MYSQL_ROOT_PASSWORD,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
});

class DB {
	constructor(database, config = {}) {
		this.database = database;
		this.config = config;
		switch (database) {
			case 'general':
				this.configPool = dbGeneral;
				break;
			case 'wholesalers_general':
				this.configPool = dbWholesalersGeneral;
				break;
		}
	}

	async changeUser() {
		const conn = await usersPool.getConnection();
		const base = this.database.split('_')[0].toUpperCase();
		await conn.changeUser({
			user: this.config.hasOwnProperty('user') ? this.config.user : eval(`process.env.DB_${base}_USER`),
			password: this.config.hasOwnProperty('password') ? this.config.password : eval(`process.env.DB_${base}_PASSWORD`),
			database: this.database
		});
		return conn;
	}

	async init() {
		if (this.configPool) {
			return this.configPool.getConnection();
		} else {
			return this.changeUser()
		}
	}
}

export default DB;