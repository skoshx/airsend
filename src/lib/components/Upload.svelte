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
			console.log('CHANGED ');
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

<div class="p-4 w-max mx-auto" bind:this={dropArea} on:click={upload}>
	<input class="hidden" bind:this={fileInput} type="file" />
	<slot />
</div>
