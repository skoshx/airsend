import { browser } from '$app/env';
import { parse } from 'cookie';
import type Peer from 'peerjs';
import { derived, readable, writable } from 'svelte/store';
import { deriveUsernameFromUuid } from './names';
import type { ReceivedFileType } from './network';
import { get, getEndpoint } from './util';

/* export const dark = writable(
	browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
); */
export const dark = writable(false);

// Network
export type NetworkType = 'anyone' | 'network';
export const network = writable<NetworkType>('network');

export const fileQueue = writable<ReceivedFileType[]>([]);

export const peer = writable<Peer>();

export const username = derived(peer, $peer => $peer ? deriveUsernameFromUuid($peer.id) : undefined);

export const peers = readable<string[]>([], (set) => {
	const interval = setInterval(async () => {
		const { data: peers, error } = await get<string[]>(getEndpoint() + '/peers');
		if (error) throw Error(`could not find other peers: ${error}`);
		if (!peers) throw Error(`peers is null`);
		// if (error) return alert(`Error: ${error}`);
		// if (!peers) return alert('not peers');
		set(peers);
	}, 1_000);
	return () => clearInterval(interval);
});

// export const peers = writable(['1233232124-a32342wd2a', '1233232124-a32342wd2a', '1233232124-a32342wd2a']);

export const arangedPeers = derived(peers, $peers => {
	let peersCopy = [...$peers];
	const aranged: string[][] = [];
	if ($peers.length < 3) return [$peers];
	for (let i = 2; i <= $peers.length; i++) {
		aranged.push(peersCopy.slice(0, i));
		peersCopy = peersCopy.slice(i);
	}
	return aranged.filter((peers: string[]) => peers.length !== 0);
});
