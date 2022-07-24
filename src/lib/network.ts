import { writable } from 'svelte/store';
import type { DataConnection } from 'peerjs';
import { fileToChunks } from './chunker';
import { sendProgress, type SendProgress } from './stores';

export async function sendJSON(object: any, connection: DataConnection) {
	connection.send(JSON.stringify(object));
}

export async function sendFile(
	file: File,
	connection: DataConnection,
	senderId: string,
	receiverId: string
) {
	function onChunk(chunk: OrderedChunk) {
		connection.send({
			chunk,
			fileName: file.name,
			fileType: file.type,
			senderId,
			fileSize: file.size
		} as ReceivedChunk);
	}

	function onProgress(progress: number) {
		sendProgress.update((sendProgressValues: SendProgress[]) => {
			const existingProgress = sendProgressValues.find(
				(progressValue) => progressValue.receiverId === receiverId
			);
			if (existingProgress) {
				return sendProgressValues.map((value) => {
					if (value.receiverId === receiverId) return { receiverId, progress };
					return value;
				});
			} else {
				return [...sendProgressValues, { receiverId, progress }];
			}
		});
	}

	fileToChunks(file, onChunk, onProgress);

	connection.on('error', console.error);
	connection.on('data', console.log);
}
