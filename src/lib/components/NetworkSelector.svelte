<script lang="ts">
	import { network, type NetworkType } from "$lib/stores";
	import Text from "./Text.svelte";

	function switchNetwork(e: Event) {
		network.set((e.target as HTMLSelectElement).value as NetworkType);
	}

	let localNetwork: NetworkType = 'anyone';

	network.subscribe((network) => localNetwork = network);
</script>


<div class="flex items-center text-blue-400">
	<Text>Allow me to be discovered by</Text>

	<select value={localNetwork} class="text-sm outline-none" on:select={switchNetwork} on:change={switchNetwork}>
		<option value="anyone">anyone on Earth</option>
		<option value="network">people on my network</option>
	</select>
</div>
