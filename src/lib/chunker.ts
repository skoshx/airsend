import type { OrderedChunk, ReceivedChunk } from './network';

const CHUNK_SIZE = 16_384; // 16 KB

export function fileToChunks(
	file: File,
	onChunk: (chunk: OrderedChunk) => void,
	onProgress?: (progress: number) => void
) {
	if (file.size === 0) throw Error('Cannot chunk empty file.');
	const fileReader = new FileReader();
	let offset = 0;
	// fileReader.addEventListener('error', error => console.error('Error reading file:', error));
	// fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
	fileReader.addEventListener('error', console.error);
	fileReader.addEventListener('abort', console.error);
	fileReader.addEventListener('load', (e) => {
		// console.log('FileRead.onload ', e);
		onChunk({ chunk: e.target?.result, offset });
		// @ts-ignore
		offset += e.target?.result?.byteLength;
		onProgress?.(offset / file.size); // update progress
		if (offset < file.size) readSlice(offset);
	});
	const readSlice = (chunkOffset: number) => {
		// console.log('readSlice ', chunkOffset);
		const slice = file.slice(offset, chunkOffset + CHUNK_SIZE);
		fileReader.readAsArrayBuffer(slice);
	};
	readSlice(0);
}

let RECEIVE_BUFFER: OrderedChunk[] = [];
let receivedSize = 0;

export function digestChunks(
	chunk: ReceivedChunk,
	onComplete: (blob: Blob) => void,
	onProgress?: (progress: number) => void
) {
	RECEIVE_BUFFER.push(chunk.chunk);
	// @ts-ignore
	receivedSize += chunk.chunk.chunk.byteLength;
	console.log('receiveeSize', receivedSize);
	onProgress?.(receivedSize / chunk.fileSize); // update progress
	if (receivedSize === chunk.fileSize) {
		// sort receive buffer
		const filteredBuffer = RECEIVE_BUFFER.sort((a, b) => a.offset - b.offset).map(
			(chunk) => chunk.chunk
		);
		console.log('FILTERED BUFFER');
		console.log(filteredBuffer);
		// @ts-ignore
		onComplete(new Blob(filteredBuffer));
		// reset buffer & size
		RECEIVE_BUFFER = [];
		receivedSize = 0;
	}
}
