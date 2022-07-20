<script lang="ts">
	import { expandHorizontal } from '$lib/animation';
	import { createEventDispatcher } from 'svelte';
	import { twMerge } from 'tailwind-merge';
	import Text from './Text.svelte';

	const dispatch = createEventDispatcher();
	export let disabled = false;
	export let block = false;
	export let icon: any = undefined;
	export let iconRight: any = undefined;
	export let showLoader = false;
	let internalLoading = false;
	export let shadow = true;
	export let size: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' = 'tiny';
	export let type: 'primary' | 'default' | 'secondary' | 'outline' | 'dashed' | 'link' | 'text' =
		'primary';

	export let danger = false;
	export let htmlType: 'button' | 'submit' | 'reset' = 'button';
	export let textAlign: 'left' | 'center' | 'right' = 'center';
	export let tabIndex: 0 | -1 = -1;

	let classes = '';
	export { classes as class };

	function getStylesBySize() {
		if (size === 'tiny') return 'px-2 py-2 text-xs leading-4';
		if (size === 'small') return 'px-3 py-2 text-sm leading-4';
		if (size === 'medium') return 'px-4 py-2 text-sm';
		if (size === 'large') return 'px-5 py-2 text-base';
		if (size === 'xlarge') return 'px-6 py-3 text-base';
		return 'px-2.5 py-1.5 text-xs';
	}
	function getStylesByType() {
		if (type === 'default')
			return 'text-gray-500 bg-white border-gray-200 hover:text-gray-600 hover:bg-white hover:border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-dark-200 dark:hover:bg-gray-700';
		if (type === 'secondary')
			return 'text-gray-600 bg-gray-200 hover:text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600';
		if (type === 'outline')
			return 'border text-gray-500 bg-transparent border-gray-200 border-solid hover:bg-white hover:text-gray-600 hover:border-gray-600 dark:text-white dark:border-dark-400 dark:hover:text-dark-600 dark:hover:border-white';
		if (type === 'dashed')
			return 'border text-gray-500 bg-transparent border-gray-200 border-dashed hover:text-gray-600 hover:border-gray-600 dark:text-white dark:border-dark-400 dark:hover:text-white dark:hover:border-white';
		if (type === 'link')
			return 'bg-transparent text-brand-800 hover:bg-brand-900 hover:bg-opacity-25';
		if (type === 'text')
			return 'text-gray-400 bg-transparent hover:bg-gray-200 hover:bg-opacity-25 dark:text-dark-300 dark:hover:bg-dark-600';
		return 'text-white bg-brand-600 hover:bg-brand-400 dark:hover:bg-brand-700';
	}

	function handleClick(e: MouseEvent) {
		if (!showLoader) return dispatch('click', e);
		if (internalLoading) return;
		internalLoading = true;
		dispatch('click', {
			finishLoading: () => {
				internalLoading = false;
			}
		});
	}
	function getIconSize() {
		if (size === 'medium') return '20px';
		if (size === 'large' || size === 'xlarge') return '24px';
		return '16px';
	}
</script>

<button
	on:click={handleClick}
	style={`text-align: ${textAlign}`}
	type={htmlType}
	class={twMerge(
		'relative cursor-pointer inline-flex items-center space-x-2 text-center border border-solid border-transparent transition ease-out duration-200 outline-none rounded font-medium',
		shadow && 'shadow-sm',
		block && 'w-full flex items-center justify-center',
		disabled && 'opacity-75 cursor-not-allowed pointer-events-none',
		getStylesBySize(),
		getStylesByType(),
		danger &&
			'border-red-500 text-red-500 dark:border-red-500 dark:text-red-500 shadow-[0px 0px 4px rgba(229, 62, 62 / 50%)]',
		danger && type === 'primary' && 'bg-red-500 text-white hover:bg-red-600 hover:border-red-600',
		classes
	)}
>
	{#if internalLoading}
		<div transition:expandHorizontal class="overflow-hidden w-max animate-spin-slow mr-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				style="width: {getIconSize()}; height: {getIconSize()}"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="12" y1="2" x2="12" y2="6" />
				<line x1="12" y1="18" x2="12" y2="22" />
				<line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
				<line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
				<line x1="2" y1="12" x2="6" y2="12" />
				<line x1="18" y1="12" x2="22" y2="12" />
				<line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
				<line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
			</svg>
		</div>
	{/if}
	{#if icon}<svelte:component
			this={icon}
			style="width: {getIconSize()}; height: {getIconSize()}"
			class="mr-2"
		/>{/if}
	<Text {textAlign} class="text-inherit w-full"><slot /></Text>
	{#if iconRight}<svelte:component
			this={iconRight}
			style="width: {getIconSize()}; height: {getIconSize()}"
			class="ml-2"
		/>{/if}
</button>
