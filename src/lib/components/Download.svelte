<script lang="ts">
	import { deriveUsernameFromUuid } from "$lib/names";
	import { fileQueue } from "$lib/stores";
	import { quintOut } from "svelte/easing";
	import { get } from "svelte/store";
	import { fly } from "svelte/transition";
	import Text from "./Text.svelte";
	import Title from "./Title.svelte";
	import DocumentDownloadIcon from "heroicons/svelte/outline/DocumentDownloadIcon.svelte";
	import { onMount } from "svelte";

	let downloadElement: HTMLAnchorElement;
	
	function decline() {
		fileQueue.update((files) => files.splice(1));
	}
	function accept() {
		// download file
		const url = URL.createObjectURL($fileQueue[0].blob);
		downloadElement.href = url;
		downloadElement.download = get(fileQueue)[0].fileName;
		downloadElement.click();
		// then update file queue
		fileQueue.update((files) => files.splice(1));
	}
	
	function formatFileSize(bytes: number) {
		if (bytes >= 1e9) {
			return (Math.round(bytes / 1e8) / 10) + ' GB';
		} else if (bytes >= 1e6) {
			return (Math.round(bytes / 1e5) / 10) + ' MB';
		} else if (bytes > 1000) {
			return Math.round(bytes / 1000) + ' KB';
		} else {
			return bytes + ' Bytes';
		}
	}
</script>

{#if $fileQueue.length > 0}
<a bind:this={downloadElement}></a>
<div transition:fly={{duration: 600, easing: quintOut}} class="absolute inset-0 bg-black/25 flex items-center justify-center">
	<div class="backdrop-blur-xl bg-white/50 dark:bg-black/50 p-4 rounded-xl flex flex-col justify-center space-y-4 w-72 fixed">
		<div class="space-y-2">
			<Title textAlign="center">Airdrop</Title>
			<Text type="secondary" textAlign="center">{deriveUsernameFromUuid($fileQueue[0].senderId)} want's to send you a file.</Text>
		</div>
		<!-- This only if sent file is image mime type -->
		<!--<img src={URL.createObjectURL($fileQueue[0].file)} alt="sent file" />-->
		<div class="space-y-4 flex flex-col items-center">
			{#if $fileQueue[0].fileType.includes('image')}
			<img class="max-h-40 rounded-lg" src={URL.createObjectURL($fileQueue[0].blob)} alt="sent file" />
			{:else}
			<DocumentDownloadIcon class="w-12 h-12" />
			{/if}
			<div>
				<Title>{$fileQueue[0].fileName}</Title>
				<Text type="secondary">{formatFileSize($fileQueue[0].fileSize)}</Text>
			</div>
		</div>
		<div class="grid grid-cols-2">
			<div class="px-4 py-2 flex items-center justify-center cursor-pointer" on:click={decline}>
				<Text class="text-red-500">Decline</Text>
			</div>
			
			<div class="px-4 py-2 flex items-center justify-center cursor-pointer" on:click={accept}>
				<Text class="text-green-500">Accept</Text>
			</div>
		</div>
	</div>
</div>
{/if}
