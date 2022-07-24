import { MyWebSocket } from '../services/webSocketServer/webSocket';
import { IncomingMessage } from 'http';
import UAParser from 'ua-parser-js';

export interface IClient {
	getDeviceName(): string;

	getId(): string;

	getToken(): string;

	getSocket(): MyWebSocket | null;

	setSocket(socket: MyWebSocket | null): void;

	getLastPing(): number;

	setLastPing(lastPing: number): void;

	send<T>(data: T): void;
}

function getDeviceName(req: IncomingMessage): string {
	const parsed = UAParser(req.headers['user-agent']);
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

export class Client implements IClient {
	private readonly id: string;
	private readonly token: string;
	private readonly deviceName: string;
	private socket: MyWebSocket | null = null;
	private lastPing: number = new Date().getTime();

	constructor({ id, token, req }: { id: string; token: string; req: IncomingMessage }) {
		this.id = id;
		this.token = token;

		this.deviceName = getDeviceName(req);
	}

	public getDeviceName(): string {
		return this.deviceName;
	}

	public getId(): string {
		return this.id;
	}

	public getToken(): string {
		return this.token;
	}

	public getSocket(): MyWebSocket | null {
		return this.socket;
	}

	public setSocket(socket: MyWebSocket | null): void {
		this.socket = socket;
	}

	public getLastPing(): number {
		return this.lastPing;
	}

	public setLastPing(lastPing: number): void {
		this.lastPing = lastPing;
	}

	public send<T>(data: T): void {
		this.socket?.send(JSON.stringify(data));
	}
}
