import { writable } from "svelte/store";
import type { DataConnection } from 'peerjs';

const fileQueue = writable<File[]>([]);

export function dequeFile() {
}

export async function sendJSON(object: any, connection: DataConnection) {
	connection.send(JSON.stringify(object));
}

export async function sendFile(file: File, connection: DataConnection) {
	const blob = new Blob([file], { type: file.type });
	console.log("Sending ");
	console.log({ file: blob, fileName: file.name, fileType: file.type });
	connection.send({ file: blob, fileName: file.name, fileType: file.type }, true);
	/* sendJSON({
		type: 'header',
		name: file.name,
		mime: file.type,
		size: file.size
	}, connection);
	this._chunker = new FileChunker(file,
			chunk => this._send(chunk),
			offset => this._onPartitionEnd(offset));
	this._chunker.nextPartition(); */
}
