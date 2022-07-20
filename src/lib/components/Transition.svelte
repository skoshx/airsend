<script lang="ts">
	import { browser } from '$app/env';
	import { onMount } from 'svelte';

	export let show: boolean = false;
	// export let as: any = null;
	export let enter: string = '';
	export let enterFrom: string = '';
	export let enterTo: string = '';
	export let leave: string = '';
	export let leaveFrom: string = '';
	export let leaveTo: string = '';

	// We need to skip the first state "update"
	// since it's basically initial state, not
	// necessarily a state update.
	let skipState = true;
	let classes = '';
	export { classes as class };

	let currentClass = `${enter} ${enterFrom}`;
	let transitionContainer: HTMLDivElement = null;

	onMount(() => {
		transitionContainer.addEventListener('transitionend', () => {
			if (!show) currentClass = `${currentClass} hidden`;
		});
	});

	$: {
		if (browser && !skipState) {
			currentClass = show ? `${enter} ${enterFrom}` : `${leave} ${leaveFrom}`;
			requestAnimationFrame(() => {
				currentClass = show ? `${enter} ${enterTo}` : `${leave} ${leaveTo}`;
			});
		}
		skipState = false;
	}
</script>

<div class={`${currentClass} ${classes}`} bind:this={transitionContainer}><slot /></div>
