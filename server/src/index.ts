import express from 'express';
import http from 'http';
import https from 'https';
import { Server } from 'net';

import defaultConfig, { IConfig } from './config';
import { createInstance } from './instance';

type Optional<T> = {
	[P in keyof T]?: T[P] | undefined;
};

function ExpressPeerServer(server: Server, options?: IConfig) {
	const app = express();

	const newOptions: IConfig = {
		...defaultConfig,
		...options
	};

	if (newOptions.proxied) {
		app.set('trust proxy', newOptions.proxied === 'false' ? false : !!newOptions.proxied);
	}

	app.on('mount', () => {
		if (!server) {
			throw new Error('Server is not passed to constructor - ' + "can't start PeerServer");
		}

		createInstance({ app, server, options: newOptions });
	});

	return app;
}

function PeerServer(options: Optional<IConfig> = {}, callback?: (server: Server) => void) {
	const app = express();

	let newOptions: IConfig = {
		...defaultConfig,
		...options
	};

	const port = newOptions.port;
	const host = newOptions.host;

	let server: Server;

	const { ssl, ...restOptions } = newOptions;
	if (ssl && Object.keys(ssl).length) {
		server = https.createServer(ssl, app);

		newOptions = restOptions;
	} else {
		server = http.createServer(app);
	}

	const peerjs = ExpressPeerServer(server, newOptions);
	app.use(peerjs);

	server.listen(port, host, () => callback?.(server));

	return peerjs;
}

export { ExpressPeerServer, PeerServer };

const opts: Optional<IConfig> = {
	allow_discovery: true,
	port: process.env.PORT ? parseInt(process.env.PORT) : 9000,
};
const userPath = '/';
const version = '1.4.5';

process.on('SIGINT', () => {
	process.exit(1);
});

const server = PeerServer(opts, (server) => {
	// @ts-ignore
	const host = server?.address()?.address;
	// @ts-ignore
	const port = server?.address()?.port;

	console.log(
		'Started PeerServer on %s, port: %s, path: %s (v. %s)',
		host,
		port,
		userPath || '/',
		version
	);

	const shutdownApp = () => {
		server.close(() => {
			console.log('Http server closed.');

			process.exit(0);
		});
	};

	process.on('SIGINT', shutdownApp);
	process.on('SIGTERM', shutdownApp);
});

server.on('connection', (client) => {
	// @ts-ignore
	console.log(`Client connected: ${client.getId()}`);
});

server.on('disconnect', (client) => {
	// @ts-ignore
	console.log(`Client disconnected: ${client.getId()}`);
});
