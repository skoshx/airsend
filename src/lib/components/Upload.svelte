<script lang="ts">
	import Text from './Text.svelte';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	let files: File[] = [];

	let fileInput: HTMLInputElement;
	let dropArea: HTMLDivElement;

	const dispatcher = createEventDispatcher();

	onMount(() => {
		dropArea.addEventListener('dragover', (e) => e.preventDefault(), false);
		dropArea.addEventListener(
			'drop',
			(e: DragEvent) => {
				e?.preventDefault();
				const file = e?.dataTransfer?.files?.[0];
				if (!file) return;
				files = [file];

				dispatcher('upload', { file });
			},
			false
		);

		fileInput.addEventListener('change', () => {
			console.log("CHANGED ");
			const file = fileInput?.files?.[0];
			if (!file) return;
			files = [file];
			dispatcher('upload', { file });
		});
	});

	async function upload() {
		fileInput.click();
		/* const file = fileInput?.files?.[0];
		if (!file) return;
		files = [file];
		dispatcher('upload', { file }); */
	}
</script>

<div class="p-4" bind:this={dropArea} on:click={upload}>
	<input class="hidden" bind:this={fileInput} type="file" />
	<slot />
</div>

<!--<div
	class="flex flex-col gap-8 justify-evenly border-dashed border-gray-800 border-2 rounded-md p-4"
	bind:this={dropArea}
>
	<div class="space-y-1 text-center">
		<svg
			class="mx-auto h-12 w-12 text-gray-400"
			stroke="currentColor"
			fill="none"
			viewBox="0 0 48 48"
			aria-hidden="true"
		>
			<path
				d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<div class="flex text-sm text-gray-600">
			<Text class="m-auto text-center flex">
				<a href="#" target="_self" class="mr-1" on:click={upload}>Upload a file</a>
				or drag and drop
			</Text>
		</div>
		<Text type="secondary" textAlign="center">PNG, JPG, GIF up to 10MB</Text>
	</div>

	Previews
	{#if files.length > 0}
		{#each files as file}
			<img
				class="h-32 object-cover w-full rounded-lg"
				src={URL.createObjectURL(file)}
				alt={file.name}
			/>
		{/each}
	{/if}
</div>-->
