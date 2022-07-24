'use strict';
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
	if ((from && typeof from === 'object') || typeof from === 'function') {
		for (let key of __getOwnPropNames(from))
			if (!__hasOwnProp.call(to, key) && key !== except)
				__defProp(to, key, {
					get: () => from[key],
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (
	(target = mod != null ? __create(__getProtoOf(mod)) : {}),
	__copyProps(
		isNodeMode || !mod || !mod.__esModule
			? __defProp(target, 'default', { value: mod, enumerable: true })
			: target,
		mod
	)
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// server/index.ts
var server_exports = {};
__export(server_exports, {
	ExpressPeerServer: () => ExpressPeerServer,
	PeerServer: () => PeerServer
});
module.exports = __toCommonJS(server_exports);
var import_express7 = __toESM(require('express'), 1);
var import_http = __toESM(require('http'), 1);
var import_https = __toESM(require('https'), 1);

// server/config/index.ts
var defaultConfig = {
	host: '::',
	port: 9e3,
	expire_timeout: 5e3,
	alive_timeout: 6e4,
	key: 'peerjs',
	path: '/',
	concurrent_limit: 5e3,
	allow_discovery: false,
	proxied: false,
	cleanup_out_msgs: 1e3
};
var config_default = defaultConfig;

// server/instance.ts
var import_express6 = require('express');
var import_path = __toESM(require('path'), 1);

// server/services/webSocketServer/webSocket.ts
var import_ws = require('ws');

// server/models/client.ts
var import_ua_parser_js = __toESM(require('ua-parser-js'), 1);
function getDeviceName(req) {
	const parsed = (0, import_ua_parser_js.default)(req.headers['user-agent']);
	let deviceName = '';
	if (parsed.os && parsed.os.name) {
		deviceName = parsed.os.name.replace('Mac OS', 'Mac') + ' ';
	}
	if (parsed.device.model) {
		deviceName += parsed.device.model;
	} else {
		deviceName += parsed.browser.name;
	}
	if (!deviceName) deviceName = 'Unknown Device';
	return deviceName;
}
var Client = class {
	id;
	token;
	deviceName;
	socket = null;
	lastPing = new Date().getTime();
	constructor({ id, token, req }) {
		this.id = id;
		this.token = token;
		this.deviceName = getDeviceName(req);
	}
	getDeviceName() {
		return this.deviceName;
	}
	getId() {
		return this.id;
	}
	getToken() {
		return this.token;
	}
	getSocket() {
		return this.socket;
	}
	setSocket(socket) {
		this.socket = socket;
	}
	getLastPing() {
		return this.lastPing;
	}
	setLastPing(lastPing) {
		this.lastPing = lastPing;
	}
	send(data) {
		var _a;
		(_a = this.socket) == null ? void 0 : _a.send(JSON.stringify(data));
	}
};

// server/models/realm.ts
var import_uuid = require('@lukeed/uuid');

// server/models/messageQueue.ts
var MessageQueue = class {
	lastReadAt = new Date().getTime();
	messages = [];
	getLastReadAt() {
		return this.lastReadAt;
	}
	addMessage(message) {
		this.messages.push(message);
	}
	readMessage() {
		if (this.messages.length > 0) {
			this.lastReadAt = new Date().getTime();
			return this.messages.shift();
		}
		return void 0;
	}
	getMessages() {
		return this.messages;
	}
};

// server/models/realm.ts
var Realm = class {
	clients = /* @__PURE__ */ new Map();
	messageQueues = /* @__PURE__ */ new Map();
	getClients() {
		return new Map(this.clients);
	}
	getClientsIds() {
		return [...this.clients.keys()];
	}
	getClientById(clientId) {
		return this.clients.get(clientId);
	}
	getClientsIdsWithQueue() {
		return [...this.messageQueues.keys()];
	}
	setClient(client, id) {
		this.clients.set(id, client);
	}
	removeClientById(id) {
		const client = this.getClientById(id);
		if (!client) return false;
		this.clients.delete(id);
		return true;
	}
	getMessageQueueById(id) {
		return this.messageQueues.get(id);
	}
	addMessageToQueue(id, message) {
		var _a;
		if (!this.getMessageQueueById(id)) {
			this.messageQueues.set(id, new MessageQueue());
		}
		(_a = this.getMessageQueueById(id)) == null ? void 0 : _a.addMessage(message);
	}
	clearMessageQueue(id) {
		this.messageQueues.delete(id);
	}
	generateClientId(generateClientId) {
		const generateId = generateClientId ? generateClientId : import_uuid.v4;
		let clientId = generateId();
		while (this.getClientById(clientId)) {
			clientId = generateId();
		}
		return clientId;
	}
};

// server/services/checkBrokenConnections/index.ts
var DEFAULT_CHECK_INTERVAL = 300;
var CheckBrokenConnections = class {
	checkInterval;
	timeoutId = null;
	realm;
	config;
	onClose;
	constructor({ realm, config, checkInterval = DEFAULT_CHECK_INTERVAL, onClose }) {
		this.realm = realm;
		this.config = config;
		this.onClose = onClose;
		this.checkInterval = checkInterval;
	}
	start() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.timeoutId = setTimeout(() => {
			this.checkConnections();
			this.timeoutId = null;
			this.start();
		}, this.checkInterval);
	}
	stop() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
	checkConnections() {
		var _a, _b;
		const clientsIds = this.realm.getClientsIds();
		const now = new Date().getTime();
		const { alive_timeout: aliveTimeout } = this.config;
		for (const clientId of clientsIds) {
			const client = this.realm.getClientById(clientId);
			if (!client) continue;
			const timeSinceLastPing = now - client.getLastPing();
			if (timeSinceLastPing < aliveTimeout) continue;
			try {
				(_a = client.getSocket()) == null ? void 0 : _a.close();
			} finally {
				this.realm.clearMessageQueue(clientId);
				this.realm.removeClientById(clientId);
				client.setSocket(null);
				(_b = this.onClose) == null ? void 0 : _b.call(this, client);
			}
		}
	}
};

// server/messageHandler/handlers/heartbeat/index.ts
var HeartbeatHandler = (client) => {
	if (client) {
		const nowTime = new Date().getTime();
		client.setLastPing(nowTime);
	}
	return true;
};

// server/messageHandler/handlers/transmission/index.ts
var TransmissionHandler = ({ realm }) => {
	const handle = (client, message) => {
		const type = message.type;
		const srcId = message.src;
		const dstId = message.dst;
		const destinationClient = realm.getClientById(dstId);
		if (destinationClient) {
			const socket = destinationClient.getSocket();
			try {
				if (socket) {
					const data = JSON.stringify(message);
					socket.send(data);
				} else {
					throw new Error('Peer dead');
				}
			} catch (e) {
				if (socket) {
					socket.close();
				} else {
					realm.removeClientById(destinationClient.getId());
				}
				handle(client, {
					type: 'LEAVE' /* LEAVE */,
					src: dstId,
					dst: srcId
				});
			}
		} else {
			const ignoredTypes = ['LEAVE' /* LEAVE */, 'EXPIRE' /* EXPIRE */];
			if (!ignoredTypes.includes(type) && dstId) {
				realm.addMessageToQueue(dstId, message);
			} else if (type === 'LEAVE' /* LEAVE */ && !dstId) {
				realm.removeClientById(srcId);
			} else {
			}
		}
		return true;
	};
	return handle;
};

// server/messageHandler/handlersRegistry.ts
var HandlersRegistry = class {
	handlers = /* @__PURE__ */ new Map();
	registerHandler(messageType, handler) {
		if (this.handlers.has(messageType)) return;
		this.handlers.set(messageType, handler);
	}
	handle(client, message) {
		const { type } = message;
		const handler = this.handlers.get(type);
		if (!handler) return false;
		return handler(client, message);
	}
};

// server/messageHandler/index.ts
var MessageHandler = class {
	constructor(realm, handlersRegistry = new HandlersRegistry()) {
		this.handlersRegistry = handlersRegistry;
		const transmissionHandler = TransmissionHandler({ realm });
		const heartbeatHandler = HeartbeatHandler;
		const handleTransmission = (client, { type, src, dst, payload }) => {
			return transmissionHandler(client, {
				type,
				src,
				dst,
				payload
			});
		};
		const handleHeartbeat = (client, message) => heartbeatHandler(client, message);
		this.handlersRegistry.registerHandler('HEARTBEAT' /* HEARTBEAT */, handleHeartbeat);
		this.handlersRegistry.registerHandler('OFFER' /* OFFER */, handleTransmission);
		this.handlersRegistry.registerHandler('ANSWER' /* ANSWER */, handleTransmission);
		this.handlersRegistry.registerHandler('CANDIDATE' /* CANDIDATE */, handleTransmission);
		this.handlersRegistry.registerHandler('LEAVE' /* LEAVE */, handleTransmission);
		this.handlersRegistry.registerHandler('EXPIRE' /* EXPIRE */, handleTransmission);
	}
	handle(client, message) {
		return this.handlersRegistry.handle(client, message);
	}
};

// server/services/messagesExpire/index.ts
var MessagesExpire = class {
	realm;
	config;
	messageHandler;
	timeoutId = null;
	constructor({ realm, config, messageHandler }) {
		this.realm = realm;
		this.config = config;
		this.messageHandler = messageHandler;
	}
	startMessagesExpiration() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
		this.timeoutId = setTimeout(() => {
			this.pruneOutstanding();
			this.timeoutId = null;
			this.startMessagesExpiration();
		}, this.config.cleanup_out_msgs);
	}
	stopMessagesExpiration() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
	pruneOutstanding() {
		const destinationClientsIds = this.realm.getClientsIdsWithQueue();
		const now = new Date().getTime();
		const maxDiff = this.config.expire_timeout;
		const seen = {};
		for (const destinationClientId of destinationClientsIds) {
			const messageQueue = this.realm.getMessageQueueById(destinationClientId);
			if (!messageQueue) continue;
			const lastReadDiff = now - messageQueue.getLastReadAt();
			if (lastReadDiff < maxDiff) continue;
			const messages = messageQueue.getMessages();
			for (const message of messages) {
				const seenKey = `${message.src}_${message.dst}`;
				if (!seen[seenKey]) {
					this.messageHandler.handle(void 0, {
						type: 'EXPIRE' /* EXPIRE */,
						src: message.dst,
						dst: message.src
					});
					seen[seenKey] = true;
				}
			}
			this.realm.clearMessageQueue(destinationClientId);
		}
	}
};

// server/services/webSocketServer/index.ts
var import_events = __toESM(require('events'), 1);
var import_url = __toESM(require('url'), 1);
var import_ws2 = __toESM(require('ws'), 1);
var WS_PATH = 'peerjs';
var WebSocketServer = class extends import_events.default {
	path;
	realm;
	config;
	socketServer;
	constructor({ server: server2, realm, config }) {
		super();
		this.setMaxListeners(0);
		this.realm = realm;
		this.config = config;
		const path2 = this.config.path;
		this.path = `${path2}${path2.endsWith('/') ? '' : '/'}${WS_PATH}`;
		this.socketServer = new import_ws2.default.Server({
			path: this.path,
			server: server2,
			handleProtocols: (protocols) => {
				var _a;
				return (_a = [...protocols]) == null ? void 0 : _a[0];
			}
		});
		this.socketServer.on('connection', (socket, req) => this._onSocketConnection(socket, req));
		this.socketServer.on('error', (error) => this._onSocketError(error));
	}
	_onSocketConnection(socket, req) {
		const { query = {} } = import_url.default.parse(req.url ?? '', true);
		const { id, token, key } = query;
		if (!id || !token || !key) {
			return this._sendErrorAndClose(
				socket,
				'No id, token, or key supplied to websocket server' /* INVALID_WS_PARAMETERS */
			);
		}
		if (key !== this.config.key) {
			return this._sendErrorAndClose(socket, 'Invalid key provided' /* INVALID_KEY */);
		}
		const client = this.realm.getClientById(id);
		if (client) {
			if (token !== client.getToken()) {
				socket.send(
					JSON.stringify({
						type: 'ID-TAKEN' /* ID_TAKEN */,
						payload: { msg: 'ID is taken' }
					})
				);
				return socket.close();
			}
			return this._configureWS(socket, client);
		}
		this._registerClient({ socket, id, token, req });
	}
	_onSocketError(error) {
		this.emit('error', error);
	}
	_registerClient({ socket, id, token, req }) {
		const clientsCount = this.realm.getClientsIds().length;
		if (clientsCount >= this.config.concurrent_limit) {
			return this._sendErrorAndClose(
				socket,
				'Server has reached its concurrent user limit' /* CONNECTION_LIMIT_EXCEED */
			);
		}
		const newClient = new Client({ id, token, req });
		this.realm.setClient(newClient, id);
		socket.send(JSON.stringify({ type: 'OPEN' /* OPEN */ }));
		this._configureWS(socket, newClient);
	}
	_configureWS(socket, client) {
		client.setSocket(socket);
		socket.on('close', () => {
			if (client.getSocket() === socket) {
				this.realm.removeClientById(client.getId());
				this.emit('close', client);
			}
		});
		socket.on('message', (data) => {
			try {
				const message = JSON.parse(data);
				message.src = client.getId();
				this.emit('message', client, message);
			} catch (e) {
				this.emit('error', e);
			}
		});
		this.emit('connection', client);
	}
	_sendErrorAndClose(socket, msg) {
		socket.send(
			JSON.stringify({
				type: 'ERROR' /* ERROR */,
				payload: { msg }
			})
		);
		socket.close();
	}
};

// server/api/index.ts
var import_body_parser = __toESM(require('body-parser'), 1);
var import_cors = __toESM(require('cors'), 1);
var import_express5 = __toESM(require('express'), 1);

// server/api/middleware/auth/index.ts
var import_express2 = require('express');

// server/api/middleware/middleware.ts
var import_express = require('express');

// server/api/middleware/auth/index.ts
var AuthMiddleware = class {
	constructor(config, realm) {
		this.config = config;
		this.realm = realm;
	}
	handle = (req, res, next) => {
		const { id, token, key } = req.params;
		if (key !== this.config.key) {
			return res.status(401).send('Invalid key provided' /* INVALID_KEY */);
		}
		if (!id) {
			return res.sendStatus(401);
		}
		const client = this.realm.getClientById(id);
		if (!client) {
			return res.sendStatus(401);
		}
		if (client.getToken() && token !== client.getToken()) {
			return res.status(401).send('Invalid token provided' /* INVALID_TOKEN */);
		}
		next();
	};
};

// server/api/v1/calls/index.ts
var import_express3 = __toESM(require('express'), 1);
var calls_default = ({ realm, messageHandler }) => {
	const app = import_express3.default.Router();
	const handle = (req, res, next) => {
		const { id } = req.params;
		if (!id) return next();
		const client = realm.getClientById(id);
		if (!client) {
			throw new Error(`client not found:${id}`);
		}
		const { type, dst, payload } = req.body;
		const message = {
			type,
			src: id,
			dst,
			payload
		};
		messageHandler.handle(client, message);
		res.sendStatus(200);
	};
	app.post('/offer', handle);
	app.post('/candidate', handle);
	app.post('/answer', handle);
	app.post('/leave', handle);
	return app;
};

// server/api/v1/public/index.ts
var import_express4 = __toESM(require('express'), 1);
var public_default = ({ config, realm }) => {
	const app = import_express4.default.Router();
	app.get('/id', (_, res) => {
		res.contentType('html');
		res.send(realm.generateClientId(config.generateClientId));
	});
	app.get('/peers', (_, res) => {
		if (config.allow_discovery) {
			const clients = realm.getClients();
			clients.forEach((value, key) => {
				var _a;
				const socketProtocol = (_a = value.getSocket()) == null ? void 0 : _a.protocol;
				if (socketProtocol !== 'global') clients.delete(key);
			});
			const fixedClients = [];
			for (const [key, client] of clients.entries()) {
				fixedClients.push({
					id: key,
					deviceName: client.getDeviceName()
				});
			}
			return res.send(fixedClients);
		}
		res.sendStatus(401);
	});
	function ipToIpv4(ip) {
		if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1';
	}
	app.get('/network', (_, res) => {
		if (config.allow_discovery) {
			const requestIp = ipToIpv4(res.req.ip);
			const clients = realm.getClients();
			clients.forEach((value, key) => {
				if (requestIp !== ipToIpv4(value.getSocket()._socket.remoteAddress)) clients.delete(key);
			});
			const fixedClients = [];
			for (const [key, client] of clients.entries()) {
				fixedClients.push({
					id: key,
					deviceName: client.getDeviceName()
				});
			}
			return res.send(fixedClients);
		}
		res.sendStatus(401);
	});
	return app;
};

// server/api/index.ts
var Api = ({ config, realm, messageHandler }) => {
	const authMiddleware = new AuthMiddleware(config, realm);
	const app = import_express5.default.Router();
	const jsonParser = import_body_parser.default.json();
	app.use((0, import_cors.default)());
	app.get('/', (_, res) => {
		res.send({
			name: 'PeerJS server',
			description: 'A server side element to broker connections between PeerJS clients.',
			website: 'https://todo.com/'
		});
	});
	app.use('/:key', public_default({ config, realm }));
	app.use(
		'/:key/:id/:token',
		authMiddleware.handle,
		jsonParser,
		calls_default({ realm, messageHandler })
	);
	return app;
};

// server/instance.ts
var createInstance = ({ app, server: server2, options }) => {
	const config = options;
	const realm = new Realm();
	const messageHandler = new MessageHandler(realm);
	const api = Api({ config, realm, messageHandler });
	const messagesExpire = new MessagesExpire({ realm, config, messageHandler });
	const checkBrokenConnections = new CheckBrokenConnections({
		realm,
		config,
		onClose: (client) => {
			app.emit('disconnect', client);
		}
	});
	app.use(options.path, api);
	const customConfig = {
		...config,
		path: import_path.default.posix.join(app.path(), options.path, '/')
	};
	const wss = new WebSocketServer({
		server: server2,
		realm,
		config: customConfig
	});
	wss.on('connection', (client) => {
		const messageQueue = realm.getMessageQueueById(client.getId());
		if (messageQueue) {
			let message;
			while ((message = messageQueue.readMessage())) {
				messageHandler.handle(client, message);
			}
			realm.clearMessageQueue(client.getId());
		}
		app.emit('connection', client);
	});
	wss.on('message', (client, message) => {
		app.emit('message', client, message);
		messageHandler.handle(client, message);
	});
	wss.on('close', (client) => {
		app.emit('disconnect', client);
	});
	wss.on('error', (error) => {
		app.emit('error', error);
	});
	messagesExpire.startMessagesExpiration();
	checkBrokenConnections.start();
};

// server/index.ts
function ExpressPeerServer(server2, options) {
	const app = (0, import_express7.default)();
	const newOptions = {
		...config_default,
		...options
	};
	if (newOptions.proxied) {
		app.set('trust proxy', newOptions.proxied === 'false' ? false : !!newOptions.proxied);
	}
	app.on('mount', () => {
		if (!server2) {
			throw new Error("Server is not passed to constructor - can't start PeerServer");
		}
		createInstance({ app, server: server2, options: newOptions });
	});
	return app;
}
function PeerServer(options = {}, callback) {
	const app = (0, import_express7.default)();
	let newOptions = {
		...config_default,
		...options
	};
	const port = newOptions.port;
	const host = newOptions.host;
	let server2;
	const { ssl, ...restOptions } = newOptions;
	if (ssl && Object.keys(ssl).length) {
		server2 = import_https.default.createServer(ssl, app);
		newOptions = restOptions;
	} else {
		server2 = import_http.default.createServer(app);
	}
	const peerjs = ExpressPeerServer(server2, newOptions);
	app.use(peerjs);
	server2.listen(port, host, () => (callback == null ? void 0 : callback(server2)));
	return peerjs;
}
var opts = {
	allow_discovery: true
};
var userPath = '/';
var version = '1.4.5';
process.on('SIGINT', () => {
	process.exit(1);
});
var server = PeerServer(opts, (server2) => {
	var _a, _b;
	const host = (_a = server2 == null ? void 0 : server2.address()) == null ? void 0 : _a.address;
	const port = (_b = server2 == null ? void 0 : server2.address()) == null ? void 0 : _b.port;
	console.log(
		'Started PeerServer on %s, port: %s, path: %s (v. %s)',
		host,
		port,
		userPath || '/',
		version
	);
	const shutdownApp = () => {
		server2.close(() => {
			console.log('Http server closed.');
			process.exit(0);
		});
	};
	process.on('SIGINT', shutdownApp);
	process.on('SIGTERM', shutdownApp);
});
server.on('connection', (client) => {
	console.log(`Client connected: ${client.getId()}`);
});
server.on('disconnect', (client) => {
	console.log(`Client disconnected: ${client.getId()}`);
});
// Annotate the CommonJS export names for ESM import in node:
0 &&
	(module.exports = {
		ExpressPeerServer,
		PeerServer
	});
