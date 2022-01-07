import os from 'os';

const nets = os.networkInterfaces();
const ifaces = {};

for (const name of Object.keys(nets)) {
	for (const net of nets[name]) {
		if (net.family === 'IPv4' && !net.internal) {
			if (!ifaces[name]) {
				ifaces[name] = [];
			}
			ifaces[name].push(net.address);
		}
	}
}

export default ifaces;