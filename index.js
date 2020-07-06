const { exec } = require('child_process');
const r = require('request-promise');
require('dotenv').config({ silent: true });
const { API_KEY } = process.env;

let lookup = async (ip) => {
	try
	{
		let res = await r(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}`);
		return res;
	}
	catch(err)
	{
		console.error('[ERROR] ' + err.response.body || err);
		return null;
	}
}

let conns;
exec("netstat -an", (err, stdout, stderr) => {
	if (err)
	{
		console.error(err);
		return;
	}
	conns = stdout.split('\r\n').slice(4);
	let ipList = [];
	conns.forEach(c => {
		ips = c.match(/([0-9]{1,3}\.){3}([0-9]{1,3})/g);
		if (ips)
		{
			ips = ips.filter(ip => (ip === '0.0.0.0' || ip === '127.0.0.1') ? 0 : 1);
			ipList.push(...ips);
		}
	});
	ipList = ipList.filter((ip, ind, self) => self.indexOf(ip) === ind);
	console.log('[DEBUG]', ipList);
	ipList.forEach(ip => lookup(ip).then(res => {
		res = JSON.parse(res);
		if (res && res.hasOwnProperty('district'))
			console.log(`[FOUND] ${ip} at location ${res.district}, ${res.city}, ${res.country_name}`);
	}));
});
