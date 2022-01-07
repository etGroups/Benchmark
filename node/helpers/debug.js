class DebugDB {
	constructor(conn) {
		this.conn = conn;
	}

	async name() {
		let result = await this.conn.pool.query('SELECT DATABASE()');
		return await result[0][0]['DATABASE()'];
	}
}

export default DebugDB;