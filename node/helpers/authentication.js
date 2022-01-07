import Password from "./password.js";
import DB from './db.js';
import jwt from 'jsonwebtoken';

class Authentication {
	constructor(hostname) {
		this.jwtRefreshKey = process.env.JWT_REFRESH_KEY;
		this.jwtSecretKey = process.env.JWT_SECRET_KEY;
		this.appName = 'deal';
	}

	async login(email, password) {
		let conn, user;

		try {
			switch (this.appName) {
				case 'shops':
					conn = await new DB('genaral').init();
					user = (await conn.query('SELECT id_customer, name, password FROM customers WHERE customers.email = ?', [email]))[0][0];
					user.shops = (await conn.query('SELECT id_shop, id_plan, status FROM id_customer = ?', [user['id_customer']]))[0];
					break;
				case 'deal':
					conn = await new DB('wholesalers_general').init();
					user = (await conn.query('SELECT id_customer, id_plan, name, password FROM customers WHERE email = ? AND active = 1', [email]))[0][0];
					break;
				default:
					return 'This application is not authorized to use the api';
			}

			if (await Password.password_verify(password, user.password)) {
				delete user.password;
			} else {
				return 'Your login details are incorrect';
			}
		} catch (e) {
			throw {Error: true, message: e.message};
		}

		return user;
	}

	generateToken(payload, options = {expiresIn: 300}, secret = this.jwtSecretKey) {
		return jwt.sign(payload, secret, options);
	}

	async userTokens(user) {
		let conn, tokens;

		//TODO: Checking if the user has not used up the available number of tokens

		switch (this.appName) {
			case 'shops':
				conn = await new DB('genaral').init();
				await conn.query('INSERT INTO shops_tokens(id_shop, token) VALUES(?, ?)', [idService, token]);
				break;
			case 'deal':
				conn = await new DB('wholesalers_general').init();
				tokens = await conn.query('INSERT INTO customers_tokens(id_customer, token) VALUES(?, ?)', [idService, token]);
				break;
			default:
				return 'This application is not authorized to use the api';
		}

		return tokens;
	}

	async addToken(user, idService) {
		let conn, token = this.generateToken(user, {}, this.jwtRefreshKey);

		//TODO: Checking if the user has not used up the available number of tokens

		switch (this.appName) {
			case 'shops':
				conn = await new DB('genaral').init();
				await conn.query('INSERT INTO shops_tokens(id_shop, token) VALUES(?, ?)', [idService, token]);
				break;
			case 'deal':
				conn = await new DB('wholesalers_general').init();
				await conn.query('INSERT INTO customers_tokens(id_customer, token) VALUES(?, ?)', [idService, token]);
				break;
			default:
				return 'This application is not authorized to use the api';
		}

		return token;
	}

	async refreshToken(user, oldToken) {
		let conn, isChanged, token = this.generateToken(user, {}, this.jwtRefreshKey);

		switch (this.appName) {
			case 'shops':
				conn = await new DB('genaral').init();
				isChanged = (await conn.query('UPDATE shops_tokens SET token = ? WHERE token = ?', [token, oldToken]))[0].changedRows;
				break;
			case 'deal':
				conn = await new DB('wholesalers_general').init();
				isChanged = (await conn.query('UPDATE customers_tokens SET token = ? WHERE token = ?', [token, oldToken]))[0].changedRows;
				break;
			default:
				return 'This application is not authorized to use the api';
		}

		if (!isChanged) {
			return 'token not found';
		}

		return token;
	}

	validateToken(token) {
		try {
			return jwt.verify(token, this.jwtSecretKey);
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	decodeBasic(token) {
		const encoded = token.split(' ')[1];
		const decoded = new Buffer.from(encoded, 'base64').toString();
		return decoded.split(':');
	}

	check(login, password) {

	}
}

export default Authentication;