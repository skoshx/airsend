<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	let classes = '';
	export { classes as class };

	export let type: 'default' | 'secondary' | 'success' | 'warning' | 'danger' = 'default';
	export let disabled = false;
	export let underline = false;
	export let strikethrough = false;
	export let strong = false;
	export let large = false;
	export let textAlign: 'left' | 'center' | 'right' = 'left';

	// gradient
	export let gradient: 'brand' | 'secondary' | 'tertiary' | undefined = undefined;

	function getGradientStyles(type: 'brand' | 'secondary' | 'tertiary') {
		/* const firstGradient = 'from-brand-400 via-blue-300 to-indigo-700';
    const secondGradient = 'from-pink-700 to-indigo-700';
    const thirdGradient = 'from-pink-700 via-blue-300 to-green-700'; */
		const gradients = {
			brand: 'from-brand-400 via-blue-300 to-indigo-700',
			secondary: 'from-pink-700 to-indigo-700',
			tertiary: 'from-pink-700 via-blue-300 to-green-700'
		};
		return `text-transparent bg-clip-text bg-gradient-to-r ${gradients[type]}`;
	}

	function getStyleByType(type: string) {
		if (type === 'success') return 'text-green-500 dark:text-green-500';
		if (type === 'warning') return 'text-yellow-500 text-yellow-500';
		if (type === 'danger') return 'text-red-500 text-red-500';
		if (type === 'secondary') return 'text-gray-400';
		return '';
	}
</script>

<p
	style={`text-align: ${textAlign}`}
	class={twMerge(
		'text-sm',
		getStyleByType(type),
		disabled && 'select-none text-gray-300 dark:text-gray-400 cursor-not-allowed',
		underline && 'underline',
		strikethrough && 'line-through',
		strong && 'font-semibold',
		large && 'text-lg',
		gradient && getGradientStyles(gradient),
		classes
	)}
>
	<slot />
</p>

<!--


<script lang="ts">
  import { twMerge } from "tailwind-merge";
  
  let classes = '';
  export { classes as class };
  const firstGradient = 'from-brand-400 via-blue-300 to-indigo-700';
  const secondGradient = 'from-pink-700 to-indigo-700';
  const thirdGradient = 'from-pink-700 via-blue-300 to-green-700';
</script>

<h1
  class={twMerge('pt-16 font-semibold text-6xl leading-none lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r', classes, firstGradient)}
  style="line-height: 1.1"
>
  <slot />
</h1>

<style>
  h1 {
    --gradient-color-1: #ef008f;
    --gradient-color-2: #6ec3f4;
    --gradient-color-3: #7038ff; 
    --gradient-color-4: #ffba27;
  }
</style>


-->
