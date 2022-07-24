// types

export interface SendProgress {
	receiverId: string;
	progress: number;
}

export interface Client {
	id: string;
	deviceName: string;
}

export type NetworkType = 'anyone' | 'network';

export interface ReceivedChunk {
	chunk: OrderedChunk;
	senderId: string;
	fileName: string;
	fileType: string;
	fileSize: number;
}

export interface ReceivedFileType {
	file: ArrayBuffer;
	senderId: string;
	fileName: string;
	fileType: string;
}

export type NewReceivedFile = Omit<ReceivedChunk, 'chunk'> & {
	blob: Blob;
};

export interface OrderedChunk {
	chunk: string | ArrayBuffer | null | undefined;
	offset: number;
}
