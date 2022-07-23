import type { ReceivedChunk } from "./network";

const CHUNK_SIZE = 16_384; // 16 KB

export function fileToChunks(file: File, onChunk: (chunk: string | ArrayBuffer | null | undefined) => void, onProgress?: (progress: number) => void) {
	if (file.size === 0) throw Error('Cannot chunk empty file.');
	const fileReader = new FileReader();
	let offset = 0;
	// fileReader.addEventListener('error', error => console.error('Error reading file:', error));
  // fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
	fileReader.addEventListener('error', console.error);
	fileReader.addEventListener('abort', console.error);
  fileReader.addEventListener('load', e => {
    // console.log('FileRead.onload ', e);
		onChunk(e.target?.result);
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

let RECEIVE_BUFFER: BlobPart[] = [];
let receivedSize = 0;

export function digestChunks(chunk: ReceivedChunk, onComplete: (blob: Blob) => void, onProgress?: (progress: number) => void) {
	RECEIVE_BUFFER.push(chunk.chunk);
	receivedSize += chunk.chunk.byteLength;
	onProgress?.(receivedSize / chunk.fileSize); // update progress
	if (receivedSize === chunk.fileSize) {
		onComplete(new Blob(RECEIVE_BUFFER));
		// reset buffer & size
		RECEIVE_BUFFER = [];
		receivedSize = 0;
	}
}

/* class FileChunker {

	constructor(file: File, onChunk: () => void, onPartitionEnd: () => void) {
			this._chunkSize = 64000; // 64 KB
			this._maxPartitionSize = 1e6; // 1 MB
			this._offset = 0;
			this._partitionSize = 0;
			this._file = file;
			this._onChunk = onChunk;
			this._onPartitionEnd = onPartitionEnd;
			this._reader = new FileReader();
			this._reader.addEventListener('load', e => this._onChunkRead(e.target.result));
	}

	nextPartition() {
			this._partitionSize = 0;
			this._readChunk();
	}

	_readChunk() {
			const chunk = this._file.slice(this._offset, this._offset + this._chunkSize);
			this._reader.readAsArrayBuffer(chunk);
	}

	_onChunkRead(chunk) {
			this._offset += chunk.byteLength;
			this._partitionSize += chunk.byteLength;
			this._onChunk(chunk);
			if (this._isPartitionEnd() || this.isFileEnd()) {
					this._onPartitionEnd(this._offset);
					return;
			}
			this._readChunk();
	}

	repeatPartition() {
			this._offset -= this._partitionSize;
			this._nextPartition();
	}

	_isPartitionEnd() {
			return this._partitionSize >= this._maxPartitionSize;
	}

	isFileEnd() {
			return this._offset >= this._file.size;
	}

	get progress() {
			return this._offset / this._file.size;
	}
} */
