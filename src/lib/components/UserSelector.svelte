<script lang="ts">
	import { deriveUsernameFromUuid } from "$lib/names";
	import { arangedPeers } from "$lib/stores";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";
	import { scale } from "svelte/transition";
	import Text from "./Text.svelte";
	import Title from "./Title.svelte";
	import Upload from "./Upload.svelte";
	import { parse } from 'cookie';
	import { sendFile } from "$lib/network";

	let localPeers: string[][] = [];

	let peer: any;

	onMount(async () => {
		// we need to do this dance with aranged peers & local
		// peers to get animations to show if users are instantly 
		// available…
		arangedPeers.subscribe((arangedPeers) => {
			localPeers = arangedPeers;
		});

		const { Peer } = await import('peerjs');
		const userId = parse(document.cookie)?.['userid'];
		peer = new Peer(userId, /*{
			host: '/',
			port: 9000,
		}*/);

		/* peer.on('open', async () => {
			username = deriveUsernameFromUuid(peer.id);
			console.log("My ID: ", peer.id); 
		}); */
	});

	function handleUpload(peerId: string, file: File) {
		console.log("Upload to peer ", deriveUsernameFromUuid(peerId));
		console.log("FILE ");
		console.log(file.name);

		const connection = peer.connect(peerId, { reliable: true });
		console.log("Connection");
		console.log(connection);
		sendFile(file, connection);
	}

	const getOffset = (index: number) => index * 112;
</script>

<div class="absolute inset-0">
	{#each localPeers as list, i}
	<div transition:scale={{duration: 600, easing: quintOut}} style={`bottom: ${getOffset(i)}px; grid-template-columns: repeat(${list.length}, minmax(0, 1fr));`} class={`w-full absolute grid outline-hidden`}>
		{#each list as peerId, j}
		<Upload on:upload={(event) => { handleUpload(peerId, event.detail.file ) }}>
			<div transition:scale={{delay: i * 300 + j * 200, duration: 600, easing: quintOut }} class="flex flex-col justify-center items-center h-28 w-max mx-auto cursor-pointer select-none">
				<img class="rounded-full w-12 h-12 object-cover" src={`https://avatars.dicebear.com/api/pixel-art/${peerId}.svg`} alt={`${deriveUsernameFromUuid(peerId)}'s profile`} />
				<!-- https://avatars.dicebear.com/api/pixel-art/:seed.svg -->
				<Title class="text-sm">{deriveUsernameFromUuid(peerId)}</Title>
				<Text class="text-xs" type="secondary">Mac Chrome</Text>
			</div>
		</Upload>
		<!--<div transition:scale={{delay: i * 300 + j * 200, duration: 600, easing: quintOut }} class="flex flex-col justify-center items-center h-28">
			<img class="rounded-full w-12 h-12 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" alt="profile mock" />
			<Title class="text-sm">{deriveUsernameFromUuid(peerId)}</Title>
			<Text class="text-xs" type="secondary">Mac Chrome</Text>
		</div>-->
		{/each}
	</div>
	{/each}
</div>
