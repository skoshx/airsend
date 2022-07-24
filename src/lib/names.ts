// Really basic "funny" names
export function deriveUsernameFromUuid(uuid: string) {
	const FIRST_NAMES = [
		'Runny',
		'Buttercup',
		'Lumpy',
		'Wacky',
		'Tiny',
		'Flunky',
		'Fluffy',
		'Zippy',
		'Doofus',
		'Gobsmacked',
		'Salamander',
		'Oily',
		'Burrito',
		'Bumpy',
		'Loopy',
		'Irving',
		'Egbert'
	];

	const SECOND_NAMES = [
		'Snicker',
		'Buffalo',
		'Bubble',
		'Sheep',
		'Corset',
		'Toilet',
		'Lizard',
		'Waffle',
		'Burger',
		'Chimp',
		'Gorilla',
		'Rhino',
		'Emu',
		'Pizza',
		'Toad',
		'Gerbil',
		'Pickle',
		'Tofu',
		'Chicken',
		'Potato',
		'Hamster',
		'Lemur',
		'Vermin'
	];

	const number = parseInt(uuid.replace(/\D/g, ''));

	return `${FIRST_NAMES[number % FIRST_NAMES.length]} ${
		SECOND_NAMES[number % SECOND_NAMES.length]
	}`;
}
