import argon2 from 'argon2';

class Password {
	async password_hash(password) {
		try {
			return await argon2.hash(password, {type: argon2.argon2id});
		} catch (e) {
			console.log(e);
			return false;
		}
	}

	async password_verify(password, hash) {
		try {
			return await argon2.verify(hash, password, {type: argon2.argon2id});
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

const password = new Password();
export default password;