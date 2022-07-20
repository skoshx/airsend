import { writable } from "svelte/store";
import type { DataConnection } from 'peerjs';

export interface ReceivedFileType {
	file: Blob;
	senderId: string;
	fileName: string;
	fileType: string;
}

export async function sendJSON(object: any, connection: DataConnection) {
	connection.send(JSON.stringify(object));
}

export async function sendFile(file: File, connection: DataConnection, senderId: string) {
	const blob = new Blob([file], { type: file.type });
	connection.send({ file: blob, fileName: file.name, fileType: file.type, senderId } as ReceivedFileType, true);
	connection.on('error', console.error);
	connection.on('data', console.log);
}
