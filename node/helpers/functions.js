async function execCommand(request) {
	try {
		let path = `./resources/${request.resource}.js`;
		let resource = await import('.' + path);
		let obj = new resource.default();
		return eval('obj.' + request.method + '(request.params)');
	} catch (error) {
		console.log(error);
	}
	return false;
}

export {execCommand};