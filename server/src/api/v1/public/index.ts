import express from 'express';
import { IConfig } from '../../../config';
import { IRealm } from '../../../models/realm';

export default ({ config, realm }: { config: IConfig; realm: IRealm }): express.Router => {
	const app = express.Router();

	// Retrieve guaranteed random ID.
	app.get('/id', (_, res: express.Response) => {
		res.contentType('html');
		res.send(realm.generateClientId(config.generateClientId));
	});

	// Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
	app.get('/peers', (_, res: express.Response) => {
		if (config.allow_discovery) {
			const clients = realm.getClients();

			// remove clients that are not on the global protocol.
			clients.forEach((value, key) => {
				const socketProtocol = value.getSocket()?.protocol;
				if (socketProtocol !== 'global') clients.delete(key);
			});

			const fixedClients: {}[] = [];
			for (const [key, client] of clients.entries()) {
				fixedClients.push({
					id: key,
					deviceName: client.getDeviceName()
				});
			}

			// return res.send([...clients.keys()]);
			return res.send(fixedClients);
			// return res.send(clients);
		}

		res.sendStatus(401);
	});

	function ipToIpv4(ip: string) {
		if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
	}

	// Get a list of all peers on your network, enabled by the `allowDiscovery` flag.
	app.get('/network', (_, res: express.Response) => {
		if (config.allow_discovery) {
			const requestIp = ipToIpv4(res.req.ip);
			// const clientsIds = realm.getClientsIds();
			const clients = realm.getClients();

			clients.forEach((value, key) => {
				// @ts-ignore
				if (requestIp !== ipToIpv4(value.getSocket()._socket.remoteAddress)) clients.delete(key);
			});

			const fixedClients: {}[] = [];
			for (const [key, client] of clients.entries()) {
				fixedClients.push({
					id: key,
					deviceName: client.getDeviceName()
				});
			}

			// return res.send([...clients.keys()]);
			return res.send(fixedClients);
		}

		res.sendStatus(401);
	});

	return app;
};
