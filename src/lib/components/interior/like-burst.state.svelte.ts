import { untrack } from 'svelte';

export type LikeCommit = (liked: boolean, signal: AbortSignal) => Promise<unknown>;

export type OptimisticLikeOptions = {
	initialLiked?: boolean;
	initialCount?: number;
	onCommit?: LikeCommit;
	onError?: (error: unknown) => void;
	settle?: number;
};

export class OptimisticLikeState {
	#read: () => OptimisticLikeOptions;

	#liked = $state(false);
	#count = $state(0);
	#pending = $state(false);
	#burst = $state(0);
	#settled = $state<{ liked: boolean; count: number }>({ liked: false, count: 0 });

	#likedNow: boolean;
	#countNow: number;
	#truth: { liked: boolean; count: number };

	#timer: ReturnType<typeof setTimeout> | undefined;
	#inFlight: AbortController | null = null;
	#seq = 0;

	constructor(options: OptimisticLikeOptions | (() => OptimisticLikeOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;

		const { initialLiked = false, initialCount = 0 } = untrack(this.#read);

		this.#liked = initialLiked;
		this.#count = initialCount;
		this.#settled = { liked: initialLiked, count: initialCount };
		this.#likedNow = initialLiked;
		this.#countNow = initialCount;
		this.#truth = { liked: initialLiked, count: initialCount };

		$effect(() => () => {
			clearTimeout(this.#timer);
			this.#timer = undefined;
			this.#seq += 1;
			this.#inFlight?.abort();
			this.#inFlight = null;
		});
	}

	get liked() {
		return this.#liked;
	}

	get count() {
		return this.#count;
	}

	get base() {
		return this.#liked ? this.#count - 1 : this.#count;
	}

	get pending() {
		return this.#pending;
	}

	get burst() {
		return this.#burst;
	}

	get settled() {
		return this.#settled;
	}

	toggle = () => {
		const next = !this.#likedNow;
		this.#likedNow = next;
		this.#countNow += next ? 1 : -1;

		this.#liked = next;
		this.#count = this.#countNow;
		this.#pending = true;
		if (next) this.#burst += 1;

		clearTimeout(this.#timer);
		this.#timer = setTimeout(this.#flush, this.#read().settle ?? 400);
	};

	#flush = () => {
		this.#timer = undefined;
		this.#inFlight?.abort();
		this.#inFlight = null;
		this.#seq += 1;

		const intent = this.#likedNow;

		if (intent === this.#truth.liked) {
			this.#countNow = this.#truth.count;
			this.#liked = this.#truth.liked;
			this.#count = this.#truth.count;
			this.#pending = false;
			return;
		}

		const target = { liked: intent, count: this.#countNow };
		const { onCommit, onError } = this.#read();

		if (!onCommit) {
			this.#truth = target;
			this.#settled = target;
			this.#pending = false;
			return;
		}

		const controller = new AbortController();
		const id = this.#seq;
		this.#inFlight = controller;
		this.#pending = true;

		onCommit(intent, controller.signal).then(
			() => {
				if (id !== this.#seq) return;
				this.#inFlight = null;
				this.#truth = target;
				this.#settled = target;
				this.#pending = false;
			},
			(error: unknown) => {
				if (id !== this.#seq) return;
				this.#inFlight = null;
				this.#likedNow = this.#truth.liked;
				this.#countNow = this.#truth.count;
				this.#liked = this.#truth.liked;
				this.#count = this.#truth.count;
				this.#pending = false;
				onError?.(error);
			}
		);
	};
}
