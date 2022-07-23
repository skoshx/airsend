class FileDigester {
	constructor(meta, callback) {
			this._buffer = [];
			this._bytesReceived = 0;
			this._size = meta.size;
			this._mime = meta.mime || 'application/octet-stream';
			this._name = meta.name;
			this._callback = callback;
	}

	unchunk(chunk) {
			this._buffer.push(chunk);
			this._bytesReceived += chunk.byteLength || chunk.size;
			const totalChunks = this._buffer.length;
			this.progress = this._bytesReceived / this._size;
			if (isNaN(this.progress)) this.progress = 1

			if (this._bytesReceived < this._size) return;
			// we are done
			let blob = new Blob(this._buffer, { type: this._mime });
			this._callback({
					name: this._name,
					mime: this._mime,
					size: this._size,
					blob: blob
			});
	}

}
