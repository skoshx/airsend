import { browser } from '$app/env';
import { derived, readable, writable } from 'svelte/store';
import { deriveUsernameFromUuid } from './names';
import { get, getEndpoint } from './util';
import { get as getStore } from 'svelte/store';
import type { Peer } from './peerjs/peer';
import type { Client, NetworkType, NewReceivedFile, SendProgress } from './types';

export const dark = writable(browser && localStorage.getItem('theme') === 'dark' ? true : false);


// Network
export const network = writable<NetworkType>(
	browser && localStorage.getItem('network')
		? (localStorage.getItem('network') as NetworkType)
		: 'network'
);

network.subscribe((updatedNetwork) => {
	if (browser) localStorage.setItem('network', updatedNetwork);
});

export const fileQueue = writable<NewReceivedFile[]>([]);

export const sendProgress = writable<SendProgress[]>([]);

export const peer = writable<Peer>();

export const username = derived(peer, ($peer) =>
	$peer ? deriveUsernameFromUuid($peer.id ?? '') : undefined
);

export const peers = readable<Client[]>([], (set) => {
	const interval = setInterval(async () => {
		const networkEndpoint = getStore(network) === 'network' ? '/network' : '/peers';
		const { data: peers, error } = await get<Client[]>(getEndpoint() + networkEndpoint);
		if (error) throw Error(`could not find other peers: ${error}`);
		if (!peers) throw Error(`peers is null`);
		set(peers);
	}, 1_000);
	return () => clearInterval(interval);
});

export const arangedPeers = derived(peers, ($peers) => {
	let peersCopy = [...$peers];
	const aranged: Client[][] = [];
	if ($peers.length < 3) return [$peers];
	for (let i = 2; i <= $peers.length; i++) {
		aranged.push(peersCopy.slice(0, i));
		peersCopy = peersCopy.slice(i);
	}
	return aranged.filter((peers: Client[]) => peers.length !== 0);
});
