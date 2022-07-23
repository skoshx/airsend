<script lang="ts">
	import NetworkSelector from "$lib/components/NetworkSelector.svelte";
	import Text from "$lib/components/Text.svelte";
	import { dark, network, peers } from "$lib/stores";
	import StarIcon from "heroicons/svelte/outline/StarIcon.svelte";
	import MoonIcon from "heroicons/svelte/outline/MoonIcon.svelte";
	import SunIcon from "heroicons/svelte/outline/SunIcon.svelte";
	import Title from "$lib/components/Title.svelte";
	import UserSelector from "$lib/components/UserSelector.svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { username } from "$lib/stores";
</script>

<div class="flex flex-col h-screen">
	<!-- Header -->
	<div class="w-full h-14 px-8 flex items-center">
		<div class="space-x-2 flex items-center">
			<a class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors block rounded-full" target="_blank" href="https://github.com/skoshx/airdrop">
				<StarIcon class="w-5 h-5 text-black dark:text-white" />
			</a>

			<!-- Theme switcher -->
			<div class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors block rounded-full" on:click={(e) => {
				dark.update((dark) => !dark);
			}}>
				{#if $dark}
				<SunIcon class="w-5 h-5 text-black dark:text-white" />
				{:else}
				<MoonIcon class="w-5 h-5 text-black dark:text-white" />
				{/if}
			</div>
		</div>
	</div>

	<div class="w-full flex-1 flex flex-col items-center justify-center relative max-w-3xl mx-auto">
		{#if $peers.length === 0}
		<div transition:fly={{duration: 600, easing: quintOut}} class="space-y-2 w-2/3">
			<Title textAlign="center" level={3}>Airdrop</Title>
			<Text textAlign="center" type="secondary">Open this app on other devices {$network === 'anyone' ? 'on Earth' : 'on your network'} and they will show up here.</Text>
		</div>
		{:else}
		<UserSelector />
		{/if}
	</div>

	<div class="space-y-4 flex flex-col items-center py-8">
		<div class="w-12 h-12 rounded-full bg-blue-400"></div>
		<div class="space-y-2">
			<Title textAlign="center">You are known as {$username ? $username : '—'}</Title>
			<NetworkSelector />
		</div>
	</div>

</div>