import db from '../helpers/db.js';

class CustomerResource {
	async getCustomers() {
		try {
			let result = await db.pool.query('SELECT * FROM CUSTOMER LIMIT 10');
			return result[0];
		} catch (e) {
			console.log(e);
		}
	}
}

export default CustomerResource;
