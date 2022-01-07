import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as langs from 'ajv-i18n';

const localize = {
	en: langs.default.en,
	pl: langs.default.pl,
	cs: langs.default.cs,
	de: langs.default.de,
};

const ajv = new Ajv({allErrors: true});
addFormats(ajv);

export {ajv, localize}