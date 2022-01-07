class CustomerModel {
	constructor(conn) {
		this.conn = conn;
	}

	async getCustomer(idCustomer) {
		try {
			const result = await this.conn.query('SELECT * FROM customers WHERE id_customer = ?', [idCustomer]);
			if (result[0].length < 1) {
				throw new Error('Customer with this id was not found');
			}
			return result[0][0];
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async saveToken(idCustomer, token) {
		try {
			await this.conn.query('UPDATE customers SET token = ? WHERE id_customer = ?', [token, idCustomer]);
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}
}

export default CustomerModel;