import {ajv, localize} from '../../helpers/ajv.js';

class SignupModel {
	constructor(conn) {
		this.conn = conn;
	}

	async validate(data) {
		try {
			const schema = {
				type: 'object',
				properties: {
					name: {type: 'string', minLength: 4},
					login: {type: 'string', minLength: 4},
					email: {type: 'string', format: 'email'},
					password: {type: 'string', minLength: 8},
					confirmPassword: {type: 'string', minLength: 8},
					plan: {type: 'number'},
					termsAndConditions: {const: 'on'}
				},
				required: ['name', 'login', 'email', 'password', 'confirmPassword', 'plan', 'termsAndConditions'],
				additionalProperties: false
			}

			const validate = ajv.compile(schema)

			let result = '';
			let valid = validate(data);
			if (!valid) {
				result = localize.pl(validate.errors);
				result = ajv.errorsText(validate.errors, {separator: '\n'});
			}

			if (result !== '') {
				throw new Error(result);
			}
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async validateSignupForm(params) {
		try {
			const mailNotExist = await this.checkMailNotExists(params.email);
			const subdomainsNotExist = await this.checkSubdomainsNotExists(params.login);
			const planNotExist = await this.checkPlanNotExists(params.plan);
			return {
				mailNotExist: mailNotExist,
				subdomainsNotExist: subdomainsNotExist,
				planNotExist: planNotExist
			}
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async getLocale(country) {
		try {
			const result = await this.conn.query('SELECT * FROM locales WHERE native_name = ?', [country]);
			if (result[0].length < 1) {
				throw new Error('Locale with this native_name was not found');
			}
			return result[0][0];
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async insertCustomers(params) {
		try {
			const result = await this.conn.query(
				'INSERT INTO customers (name, email, street, city, zip_code, phone) VALUES (?, ?, "", "","", "")',
				[params.name, params.email]
			);
			if (result[0].insertId.length > 0) {
				throw new Error('The user couldn\'t be added');
			}
			return result[0].insertId;
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async checkMailNotExists(email) {
		try {
			const result = await this.conn.query('SELECT * FROM customers WHERE email = ?', [email]);
			if (result[0].length > 0) {
				throw new Error('This email address exists');
			}
			return true
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async insertShops(params) {
		try {
			let date = new Date()
			date.setMonth(date.getMonth() + 1)

			const result = await this.conn.query(
				`INSERT INTO shops (id_customer, id_plan, local_domain, default_lang_code, default_country_code, template, paid_for, status)
				VALUES (?,?,?,"pl_PL","PL","zay",?,"test")`,
				[params.idUser, params.plan, params.login, date]
			);
			return result[0].insertId;
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async checkSubdomainsNotExists(login) {
		try {
			const result = await this.conn.query('SELECT * FROM shops WHERE local_domain = ?', [login]);
			if (result[0].length > 0) {
				throw new Error('This subdomains already exists');
			}
			return true
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async checkPlanNotExists(plan) {
		try {
			const result = await this.conn.query('SELECT * FROM plans WHERE id_plan = ?', [plan]);
			if (result[0].length === 0) {
				throw new Error('This plan not exists');
			}
			return true
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async createDatabase(idShop) {
		try {
			const result = await this.conn.query('CREATE DATABASE shop_' + idShop);
			return result[0][0];
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async getCreateSql(idShop) {
		try {
			const result = await this.conn.query('CALL `createDatabase`("shop_1", ?)', ["shop_" + idShop]);
			return result[0][0];
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async signupShop(params) {
		try {
			const createDatabaseStatus = await this.createDatabase(params.idShop);
			const result = await this.getCreateSql(params.idShop);
			for (const sql of result) {
				let value = Object.values(sql);
				let sqlArray = value[0].split(";");
				sqlArray.pop();
				for (const preparedSql of sqlArray) {
					let resultQuery = await this.conn.query(preparedSql);
				}
			}
			return {Error: false, message: `Gratulacje założłeś sklep ${params.login}.etshops.pl`}
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async signup(params) {
		try {
			return await this.signupShop(params);
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}
}

export default SignupModel;