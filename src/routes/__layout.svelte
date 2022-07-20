<script>
	import { browser } from '$app/env';
	import { dark } from '$lib/stores';
	import { onMount } from 'svelte';

	import '../app.css';

	dark.subscribe((isDarkMode) => {
		if (browser && !isDarkMode) return document.documentElement.classList.remove('dark');
		if (browser) document.documentElement.classList.add('dark');
	});

	onMount(() => {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
			dark.set(event.matches);
		});
	});
</script>

<slot />
