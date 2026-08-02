import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

export const RIPPLE_BASE = 40;

export type RippleSpec = {
	id: number;
	x: number;
	y: number;
	scale: number;
	released: boolean;
};

export type RippleOptions = {
	disabled?: boolean;
	max?: number;
	minVisible?: number;
	fade?: number;
};

export class RippleState {
	#read: () => RippleOptions;

	#ripples = $state.raw<RippleSpec[]>([]);

	#seq = 0;
	#keyed: number | null = null;

	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- deliberately inert
	#born = new Map<number, number>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- deliberately inert
	#timers = new Map<
		number,
		[start: ReturnType<typeof setTimeout>, drop: ReturnType<typeof setTimeout>]
	>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- deliberately inert
	#pointers = new Map<number, number>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity -- deliberately inert
	#releasing = new Set<number>();

	constructor(options: RippleOptions | (() => RippleOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;
	}

	get ripples() {
		return this.#ripples;
	}

	get fadeDuration() {
		return (this.#read().fade ?? 320) / 1000;
	}

	#forget(id: number) {
		this.#timers.get(id)?.forEach(clearTimeout);
		this.#timers.delete(id);
		this.#born.delete(id);
		this.#releasing.delete(id);
	}

	#spawn(node: HTMLElement, clientX?: number, clientY?: number) {
		const rect = node.getBoundingClientRect();
		const x = Math.round(clientX === undefined ? rect.width / 2 : clientX - rect.left);
		const y = Math.round(clientY === undefined ? rect.height / 2 : clientY - rect.top);

		const reach = Math.max(
			Math.hypot(x, y),
			Math.hypot(rect.width - x, y),
			Math.hypot(x, rect.height - y),
			Math.hypot(rect.width - x, rect.height - y)
		);

		const max = this.#read().max ?? 4;
		let next = this.#ripples;
		while (next.length > 0 && next.length >= max) {
			this.#forget(next[0].id);
			next = next.slice(1);
		}

		const id = ++this.#seq;
		this.#born.set(id, performance.now());
		this.#ripples = [
			...next,
			{ id, x, y, scale: Math.round((reach * 200) / RIPPLE_BASE) / 100, released: false }
		];
		return id;
	}

	#release(id: number) {
		if (this.#releasing.has(id)) return;
		if (!this.#ripples.some((r) => r.id === id)) return;
		this.#releasing.add(id);

		const { minVisible = 220, fade = 320 } = this.#read();
		const wait = Math.max(0, minVisible - (performance.now() - (this.#born.get(id) ?? 0)));

		const start = setTimeout(() => {
			this.#ripples = this.#ripples.map((r) => (r.id === id ? { ...r, released: true } : r));
		}, wait);

		const drop = setTimeout(() => {
			this.#forget(id);
			this.#ripples = this.#ripples.filter((r) => r.id !== id);
		}, wait + fade);

		this.#timers.set(id, [start, drop]);
	}

	#releaseAll = () => {
		const open = [...this.#pointers.values()];
		this.#pointers.clear();
		open.forEach((id) => this.#release(id));
		if (this.#keyed !== null) {
			this.#release(this.#keyed);
			this.#keyed = null;
		}
	};

	#endPointer(pointerId: number) {
		const id = this.#pointers.get(pointerId);
		if (id === undefined) return;
		this.#pointers.delete(pointerId);
		this.#release(id);
	}

	attach: Attachment<HTMLElement> = (node) => {
		const onpointerdown = (event: PointerEvent) => {
			if (this.#read().disabled) return;
			if (event.pointerType === 'mouse' && event.button !== 0) return;
			if (this.#pointers.has(event.pointerId)) return;
			node.setPointerCapture?.(event.pointerId);
			this.#pointers.set(event.pointerId, this.#spawn(node, event.clientX, event.clientY));
		};

		const onpointerend = (event: PointerEvent) => this.#endPointer(event.pointerId);

		const onkeydown = (event: KeyboardEvent) => {
			if (this.#read().disabled || event.repeat || this.#keyed !== null) return;
			if (event.key !== ' ' && event.key !== 'Enter') return;
			this.#keyed = this.#spawn(node);
		};

		const onkeyup = (event: KeyboardEvent) => {
			if (this.#keyed === null) return;
			if (event.key !== ' ' && event.key !== 'Enter' && event.key !== 'Escape') return;
			this.#release(this.#keyed);
			this.#keyed = null;
		};

		const onblur = this.#releaseAll;
		const onvisibilitychange = () => {
			if (document.hidden) this.#releaseAll();
		};

		const pointerDownEvent = on(node, 'pointerdown', onpointerdown);
		const pointerUpEvent = on(node, 'pointerup', onpointerend);
		const pointerCancelEvent = on(node, 'pointercancel', onpointerend);
		const lostPointerCaptureEvent = on(node, 'lostpointercapture', onpointerend);
		const keyDownEvent = on(node, 'keydown', onkeydown);
		const keyUpEvent = on(node, 'keyup', onkeyup);
		const blurEvent = on(node, 'blur', onblur);
		const windowBlurEvent = on(window, 'blur', onblur);
		const visibilityChangeEvent = on(document, 'visibilitychange', onvisibilitychange);

		return () => {
			pointerDownEvent();
			pointerUpEvent();
			pointerCancelEvent();
			lostPointerCaptureEvent();
			keyDownEvent();
			keyUpEvent();
			blurEvent();
			windowBlurEvent();
			visibilityChangeEvent();

			this.#timers.forEach((pair) => pair.forEach(clearTimeout));
			this.#timers.clear();
			this.#born.clear();
			this.#pointers.clear();
			this.#releasing.clear();
		};
	};
}
