<script lang="ts">
	import { browser, dev } from '$app/env';
	import { digestChunks } from '$lib/chunker';
	import Download from '$lib/components/Download.svelte';
	import type { DataConnection } from '$lib/peerjs/dataconnection';
	import { dark, fileQueue, network, peer } from '$lib/stores';
	import { parse } from 'cookie';
	import { onMount } from 'svelte';

	import '../app.css';

	dark.subscribe((isDarkMode) => {
		if (browser) localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
		if (browser && !isDarkMode) return document.documentElement.classList.remove('dark');
		if (browser) document.documentElement.classList.add('dark');
	});

	onMount(async () => {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			dark.set(event.matches);
		});

		network.subscribe(async (currentNetwork) => {
			// Setup Peer
			const { Peer } = await import('$lib/peerjs/exports');
			const userId = parse(document.cookie)?.['userid'];
			const createdPeer = new Peer(userId, {
				host: dev ? '/' : 'overrated-substance-production.up.railway.app',
				port: dev ? 9000 : 443,
				protocol: currentNetwork === 'anyone' ? 'global' : undefined
			});
			peer.set(createdPeer);
			createdPeer.on('open', () => {});
			createdPeer.on('connection', (connection: DataConnection) => {
				connection.on('error', console.error);
				// @ts-ignore
				connection.on('data', (data: ReceivedChunk) => {
					function onComplete(blob: Blob) {
						const receivedFile: NewReceivedFile = { ...data, blob };
						fileQueue.update((queue) => [...queue, receivedFile]);
					}
					function onProgress(progress: number) {
						console.log('Receive progress', progress * 100);
					}
					digestChunks(data, onComplete, onProgress);
				});
			});
			createdPeer.on('error', (e) => {
				console.error(e);
			});
		});

		// Background animations (TODO: Extract to component)
		const c = document.createElement('canvas');
		document.body.appendChild(c);
		let style: any = c.style;
		style.width = '100%';
		style.position = 'absolute';
		style.zIndex = -1;
		style.top = 0;
		style.left = 0;
		const ctx: CanvasRenderingContext2D = c.getContext('2d') as CanvasRenderingContext2D;
		let x0: number, y0: number, w: number, h: number, dw: number;

		function init() {
			w = window.innerWidth;
			h = window.innerHeight;
			c.width = w;
			c.height = h;
			x0 = w / 2;
			y0 = h - 123;
			dw = Math.max(w, h, 1000) / 13;
			drawCircles();
		}
		window.onresize = init;

		function drawCircle(radius: any) {
			ctx.beginPath();
			let color = Math.round(255 * (1 - radius / Math.max(w, h)));
			ctx.strokeStyle = 'rgba(' + color + ',' + color + ',' + color + ',0.1)';
			ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.lineWidth = 2;
		}

		let step = 0;

		function drawCircles() {
			ctx.clearRect(0, 0, w, h);
			for (let i = 0; i < 12; i++) {
				drawCircle(dw * i + (step % dw));
			}
			step += 1;
		}

		let loading = true;

		function animate() {
			if (loading || step % dw < dw - 5) {
				requestAnimationFrame(function () {
					drawCircles();
					animate();
				});
			}
		}
		init();
		animate();
	});
</script>

<slot />
<Download />
