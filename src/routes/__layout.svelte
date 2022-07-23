<script lang="ts">
	import { browser } from '$app/env';
	import { digestChunks } from '$lib/chunker';
	import Download from '$lib/components/Download.svelte';
	import type { NewReceivedFile, ReceivedChunk, ReceivedFileType } from '$lib/network';
	import { dark, fileQueue, peer } from '$lib/stores';
	import { parse } from 'cookie';
	import type { DataConnection } from 'peerjs';
	import { onMount } from 'svelte';
	
	import '../app.css';
	
	dark.subscribe((isDarkMode) => {
		if (browser && !isDarkMode) return document.documentElement.classList.remove('dark');
		if (browser) document.documentElement.classList.add('dark');
	});
	
	onMount(async () => {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			dark.set(event.matches);
		});
		
		// Setup Peer
		const { Peer } = await import('peerjs');
		const userId = parse(document.cookie)?.['userid'];
		const createdPeer = new Peer(userId, {
			host: '/',
			port: 9000,
			// debug: 3
		});
		peer.set(createdPeer);
		createdPeer.on('open', () => { console.log('open -- ') });
		createdPeer.on('connection', (connection: DataConnection) => {
			console.log('conection --');
			connection.on('error', console.error);
			// @ts-ignore
			connection.on('data', (data: ReceivedChunk) => {
				console.log("DATA ");
				console.log(data);
				function onComplete(blob: Blob) {
					const receivedFile: NewReceivedFile = { ...data, blob };
					fileQueue.update((queue) => [...queue, receivedFile]);
				}
				function onProgress(progress: number) {
					console.log("Receive progress", progress * 100);
				}
				digestChunks(data, onComplete, onProgress);
				/* const castedData = data as ReceivedFileType;
				fileQueue.update((queue) => [...queue, castedData]); */
			});
		});
		createdPeer.on('error', (e) => {
			if (e.toString().includes('is taken')) location.reload();
			console.error(e);
		});
		
		// Background animations
		// TODO: Extract to component
		let c = document.createElement('canvas');
		document.body.appendChild(c);
		let style: any = c.style;
		style.width = '100%';
		style.position = 'absolute';
		style.zIndex = -1;
		style.top = 0;
		style.left = 0;
		let ctx: any = c.getContext('2d');
		let x0: any, y0: any, w: any, h: any, dw: any;
		
		function init() {
			w = window.innerWidth;
			h = window.innerHeight;
			c.width = w;
			c.height = h;
			let offset = h > 380 ? 100 : 65;
			offset = h > 800 ? 116 : offset;
			x0 = w / 2;
			y0 = h - offset;
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
				drawCircle(dw * i + step % dw);
			}
			step += 1;
		}
		
		let loading = true;
		
		function animate() {
			if (loading || step % dw < dw - 5) {
				requestAnimationFrame(function() {
					drawCircles();
					animate();
				});
			}
		}
		// @ts-ignore
		window.animateBackground = function(l) {
			loading = l;
			animate();
		};
		init();
		animate();
	});
</script>

<slot />
<Download />
