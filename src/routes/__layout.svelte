<script lang="ts">
	import { browser } from '$app/env';
import Download from '$lib/components/Download.svelte';
import type { ReceivedFileType } from '$lib/network';
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
			port: 9000
		});
		peer.set(createdPeer);
		createdPeer.on('open', () => { console.log('open -- ') });
		createdPeer.on('connection', (connection: DataConnection) => {
			connection.on('error', console.error);
			connection.on('data', (data: unknown) => {
				const castedData = data as ReceivedFileType;
				fileQueue.update((queue) => [...queue, castedData]);
			});
		});
		createdPeer.on('error', (e) => {
			location.reload();
			console.error(e);
		});
	});
</script>

<slot />
<Download />
