import { writable } from "svelte/store";
import type { DataConnection } from 'peerjs';
import { fileToChunks } from "./chunker";
import { sendProgress, type SendProgress } from "./stores";

export interface ReceivedFileType {
	file: ArrayBuffer;
	senderId: string;
	fileName: string;
	fileType: string;
}

export type NewReceivedFile = Omit<ReceivedChunk, 'chunk'> & {
	blob: Blob;
}

export interface ReceivedChunk {
	chunk: ArrayBuffer;
	senderId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

export interface SentFileType {}

export async function sendJSON(object: any, connection: DataConnection) {
	connection.send(JSON.stringify(object));
}

export async function sendFile(file: File, connection: DataConnection, senderId: string, receiverId: string) {

	function onChunk(chunk: string | ArrayBuffer | null | undefined) {
		connection.send({ chunk, fileName: file.name, fileType: file.type, senderId, fileSize: file.size } as ReceivedChunk);
	}

	function onProgress(progress: number) {
		console.log("Progress" ,progress);
		sendProgress.update((sendProgressValues: SendProgress[]) => {
			console.log("updater calleing");
			console.log("returning ");
			const existingProgress = sendProgressValues.find((progressValue) => progressValue.receiverId === receiverId);
			if (existingProgress) {
				console.log(sendProgressValues.map((value) => {
					if (value.receiverId === receiverId) return { receiverId, progress };
					return value;
				}))
				return sendProgressValues.map((value) => {
					if (value.receiverId === receiverId) return { receiverId, progress };
					return value;
				});
			} else {
				console.log([...sendProgressValues, { receiverId, progress }]);
				return [...sendProgressValues, { receiverId, progress }];
			}
			/* console.log(sendProgressValues.map((value) => {
				console.log("Updating ");
				if (value.receiverId === receiverId) return { receiverId: receiverId, progress };
				return value;
			}));
			return sendProgressValues.map((value) => {
				console.log("Updating ");
				if (value.receiverId === senderId) return { receiverId: senderId, progress };
				return value;
			}); */
		});
	}

	fileToChunks(file, onChunk, onProgress);

	connection.on('error', console.error);
	connection.on('data', console.log);

	/* const blob = new Blob([file], { type: file.type });
	// TODO: fix type
	connection.send({ file: blob, fileName: file.name, fileType: file.type, senderId } as any, true); */
	// connection.on('error', console.error);
	// connection.on('data', console.log);
}
