import DB from '../helpers/db.js';
import SignupModel from '../models/shops/signup.js';

class SignupResource {
	constructor() {
		this.dbName = 'general';
	}

	async signup(params) {
		try {
			const conn = await new DB(this.dbName).init();
			let signupModel = new SignupModel(conn);
			conn.beginTransaction();

			if (!params.plan) {
				throw new Error('Plan is not set');
			}
			params.plan = Number(params.plan);
			await signupModel.validate(params);
			await signupModel.validateSignupForm(params);
			params.idUser = await signupModel.insertCustomers(params);
			params.idShop = await signupModel.insertShops(params);
			await signupModel.signupShop(params);

			await conn.commit();
			await conn.release();
			return params;
		} catch (e) {
			console.log(e);
			await conn.rollback();
			await conn.release();
		}
	}

	async test(params) {
		console.log(params);
	}
}

export default SignupResource;