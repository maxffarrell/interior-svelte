import { untrack } from 'svelte';

export type MorphShape = {
	d: readonly string[];
	rotate?: number;
};

export type IconMorphMode = 'stroke' | 'fill';

export type IconMorphPreset = 'menu-close' | 'play-pause' | 'plus-minus' | 'check-close';

export type IconMorphSlot = {
	key: number;
	d: string;
	visible: boolean;
};

export type IconMorphOptions = {
	preset?: IconMorphPreset;
	shapes?: readonly MorphShape[];
	mode?: IconMorphMode;
	labels?: readonly string[];
	active?: number | boolean;
	defaultActive?: number | boolean;
	setActive?: (next: number | boolean) => void;
	onActiveChange?: (index: number) => void;
	disabled?: boolean;
};

export const iconMorphPresets: Record<
	IconMorphPreset,
	{ mode: IconMorphMode; labels: readonly string[]; shapes: readonly MorphShape[] }
> = {
	'menu-close': {
		mode: 'stroke',
		labels: ['Menu', 'Close'],
		shapes: [
			{
				rotate: 0,
				d: ['M 4 7 L 20 7', 'M 4 12 L 20 12', 'M 4 17 L 20 17']
			},
			{
				rotate: 90,
				d: ['M 6.5 6.5 L 17.5 17.5', 'M 12 12 L 12 12', 'M 6.5 17.5 L 17.5 6.5']
			}
		]
	},
	'play-pause': {
		mode: 'fill',
		labels: ['Play', 'Pause'],
		shapes: [
			{
				d: ['M 8 5 L 14 8.5 L 14 15.5 L 8 19 Z', 'M 14 8.5 L 20 12 L 20 12 L 14 15.5 Z']
			},
			{
				d: ['M 8 5 L 11.5 5 L 11.5 19 L 8 19 Z', 'M 15 5 L 18.5 5 L 18.5 19 L 15 19 Z']
			}
		]
	},
	'plus-minus': {
		mode: 'stroke',
		labels: ['Add', 'Remove'],
		shapes: [
			{ rotate: 0, d: ['M 5 12 L 19 12', 'M 12 5 L 12 19'] },
			{ rotate: 180, d: ['M 5 12 L 19 12', 'M 5 12 L 19 12'] }
		]
	},
	'check-close': {
		mode: 'stroke',
		labels: ['Confirm', 'Cancel'],
		shapes: [
			{ d: ['M 5 12.5 L 10 17.5 L 19.5 7', 'M 12 12 L 12 12 L 12 12'] },
			{ d: ['M 6.5 6.5 L 12 12 L 17.5 17.5', 'M 17.5 6.5 L 12 12 L 6.5 17.5'] }
		]
	}
};

const NUMBER = /-?\d*\.?\d+/g;
const CENTER = '12';

function isCollapsed(d: string): boolean {
	const nums = d.match(NUMBER);
	if (!nums || nums.length < 4) return false;
	return nums.every((n, i) => n === nums[i % 2]);
}

function normalize(shapes: readonly MorphShape[]): IconMorphSlot[][] {
	const slots = shapes.reduce((most, s) => Math.max(most, s.d.length), 0);

	return shapes.map((shape) =>
		Array.from({ length: slots }, (_, i) => {
			const own = shape.d[i];
			const sibling = shapes.find((s) => s.d[i] !== undefined)?.d[i] ?? '';
			const d = own ?? sibling.replace(NUMBER, CENTER);
			return { key: i, d, visible: !isCollapsed(d) };
		})
	);
}

function toIndex(value: number | boolean): number {
	return typeof value === 'boolean' ? (value ? 1 : 0) : Math.trunc(value);
}

export class IconMorphState {
	#read: () => IconMorphOptions = () => ({});

	#internal = $state(0);

	#preset = $derived(iconMorphPresets[this.#read().preset ?? 'menu-close']);
	#source = $derived(this.#read().shapes ?? this.#preset.shapes);
	#frames = $derived(normalize(this.#source));

	constructor(options: IconMorphOptions | (() => IconMorphOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;
		this.#internal = toIndex(untrack(this.#read).defaultActive ?? 0);
	}

	get count() {
		return this.#source.length;
	}

	get index() {
		const { active } = this.#read();
		const raw = active === undefined ? this.#internal : toIndex(active);
		return this.count === 0 ? 0 : Math.min(Math.max(raw, 0), this.count - 1);
	}

	get slots() {
		return this.#frames[this.index] ?? [];
	}

	get rotate() {
		return this.#source[this.index]?.rotate ?? 0;
	}

	get mode(): IconMorphMode {
		return this.#read().mode ?? this.#preset.mode;
	}

	get labels() {
		return this.#read().labels ?? this.#preset.labels;
	}

	get label() {
		return this.labels[this.index] ?? '';
	}

	setIndex = (next: number) => {
		const count = this.count;
		if (count === 0) return;

		const wrapped = ((next % count) + count) % count;
		const { active, setActive, onActiveChange } = this.#read();

		if (active === undefined) this.#internal = wrapped;
		else setActive?.(typeof active === 'boolean' ? wrapped === 1 : wrapped);

		onActiveChange?.(wrapped);
	};

	toggle = () => {
		if (this.#read().disabled) return;
		this.setIndex(this.index + 1);
	};
}
