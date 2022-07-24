<script lang="ts">
	import { sendProgress } from '$lib/stores';
	import { onMount } from 'svelte';

	export let peerId: string;

	let circleElement: SVGCircleElement;

	let radius = 0;
	let circumference = 0;

	onMount(() => {
		radius = circleElement.parentElement?.clientWidth ?? 0;
		circumference = radius * 2 * Math.PI;

		circleElement.style.strokeDasharray = `${circumference} ${circumference}`;
		circleElement.style.strokeDashoffset = `${circumference}`;
	});

	sendProgress.subscribe((progressEvents) => {
		const progressEventForPeerId = progressEvents.find((event) => event.receiverId === peerId);
		if (progressEventForPeerId) {
			// update progress
			const offset = circumference - ((progressEventForPeerId.progress * 50) / 100) * circumference;
			circleElement.style.strokeDashoffset = '' + offset;
			if (progressEventForPeerId.progress === 1) {
				circleElement.classList.remove('opacity-100');
				circleElement.classList.add('opacity-0');
			} else {
				circleElement.classList.remove('opacity-0');
				circleElement.classList.add('opacity-100');
			}
		}
	});
</script>

<div class="relative overflow-visible p-2">
	<svg class="absolute inset-0" width="100%" height="100%">
		<circle
			bind:this={circleElement}
			class="p-2 transition-all duration-300 transform -rotate-90 origin-center rounded-xl"
			stroke="rgb(96 165 250)"
			stroke-width="3"
			fill="transparent"
			r="26"
			cx="50%"
			cy="50%"
		/>
	</svg>
	<slot />
</div>
