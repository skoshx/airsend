<script lang="ts">
	import { twMerge } from 'tailwind-merge';

	let classes = '';
	export { classes as class };
	export let level: 1 | 2 | 3 | 4 | 5 = 5;
	export let textAlign: 'left' | 'center' | 'right' = 'left';
	export let strong = false;
	function levelToFontSize(level?: number) {
		if (level === 1) return 'text-5xl';
		if (level === 2) return 'text-4xl';
		if (level === 3) return 'text-2xl';
		if (level === 4) return 'text-lg';
		return 'text-base';
	}
</script>

<h1
	style="text-align: {textAlign}"
	class={twMerge(
		'text-gray-900 dark:text-white font-medium',
		levelToFontSize(level),
		strong && 'font-semibold',
		classes
	)}
>
	<slot />
</h1>
