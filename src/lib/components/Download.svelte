<script lang="ts">
	import { deriveUsernameFromUuid } from "$lib/names";

	import { fileQueue } from "$lib/stores";
	import Text from "./Text.svelte";
	import Title from "./Title.svelte";
</script>

<!--{#if $fileQueue}-->
<div class="absolute inset-0 bg-black/25 flex items-center justify-center">
	<div class="backdrop-blur-xl bg-white/50 p-4 rounded-xl flex flex-col justify-center space-y-4 w-72 fixed">
		<div class="space-y-2">
			<Title textAlign="center">Airdrop</Title>
			<Text type="secondary" textAlign="center">{deriveUsernameFromUuid('19d912891')} want's to send you a file.</Text>
		</div>
		<!-- This only if sent file is image mime type -->
		<!--<img src={URL.createObjectURL($fileQueue[0].file)} alt="sent file" />-->
		<div class="grid grid-cols-2">
			<div class="px-4 py-2 flex items-center justify-center">
				<Text class="text-red-500">Decline</Text>
			</div>
	
			<div class="px-4 py-2 flex items-center justify-center">
				<Text class="text-green-500">Accept</Text>
			</div>
		</div>
	</div>
</div>
<!--{/if}-->
