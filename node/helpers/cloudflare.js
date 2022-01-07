import fetch from 'node-fetch';

const config = {
	email: 'etshops@zohomail.eu',
	token: 'AvuNxIxU_rgMLMBqtr5J8DxSx88kdONvz-IzcAyY',
	zoneId: '3366c331e42d0c3f34a5f22b6326f6ea',
	url: 'https://api.cloudflare.com/client/v4/'
};

class Cloudflare {
	constructor(config) {
		this.email = config.email;
		this.token = config.token;
		this.zoneId = config.zoneId;
		this.url = config.url;
	}

	getFetchHeaders() {
		return {
			'Authorization': `Bearer ${this.token}`,
			'Content-Type': 'application/json',
		};
	}

	async call(url, opts) {
		try {
			const response = await fetch(url, opts);
			const result = await response.json();
			if (response.status < 200 || response.status >= 300) {
				let error = {code: response.status, message: response.statusText}
				if (result) {
					error.message = result;
				}
				throw {Error: true, message: JSON.stringify(error)};
			}
			return result;

		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async getDns_records() {
		try {
			const url = `${this.url}zones/${this.zoneId}/dns_records`;
			const opts = {headers: this.getFetchHeaders()};
			return await this.call(url, opts);
		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}

	async createDns_records(name) {
		try {
			const url = `${this.url}zones/${this.zoneId}/dns_records`;
			const params = {
				type: 'AAAA',
				name: `${name}.etshops.pl`,
				content: '2a01:4f9:2b:2420::462',
				ttl: 1,
				proxied: true
			}
			const opts = {
				headers: this.getFetchHeaders(),
				method: 'POST',
				body: JSON.stringify(params)
			};
			return await this.call(url, opts);

		} catch (e) {
			throw {Error: true, message: e.message};
		}
	}
}


const cloudflare = new Cloudflare(config);
export default cloudflare;