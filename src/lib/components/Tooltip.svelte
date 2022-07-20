<script lang="ts">
	// Some changes
	let classes = '';
	export let tip: string;
	export { classes as class };
	import { twMerge } from 'tailwind-merge';
	import Text from './Text.svelte';
	import Transition from './Transition.svelte';
	import QuestionMarkCircleIcon from 'heroicons/svelte/outline/QuestionMarkCircleIcon.svelte';

	export let question = false;

	let hidden = true;

	function onHover() {
		hidden = false;
		/* setTimeout(() => {
      hidden = true;
    }, 3_000); */
	}
</script>

<div
	class={twMerge('relative', classes)}
	on:mouseleave={() => {
		hidden = true;
	}}
	on:mouseenter={onHover}
>
	<Transition
		show={!hidden}
		enter="transition ease-out-quint duration-200"
		enterFrom="transform opacity-0 scale-95"
		enterTo="transform opacity-100 scale-100"
		leave="transition ease-out-quint duration-200"
		leaveFrom="transform opacity-100 scale-100"
		leaveTo="transform opacity-0 scale-95"
		class="w-max rounded-md shadow-md p-2 absolute bottom-full border border-gray-200 transition transform origin-bottom-left opacity-0 scale-95 bg-white"
	>
		<Text>{tip}</Text>
	</Transition>
	<div class="flex items-center space-x-2">
		<slot />
		{#if question}
			<QuestionMarkCircleIcon class="h-4 w-4" />
		{/if}
	</div>
</div>
