import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type { HTMLAttributes } from 'svelte/elements';
import { on } from 'svelte/events';

export type PressOrigin = { x: number; y: number };

export type PressDepthOptions = {
	disabled?: boolean;
	onPressStart?: () => void;
	onPressEnd?: () => void;
};

export class PressDepthState {
	#read: () => PressDepthOptions;

	#pressed = $state(false);
	#tracking = $state(false);
	#origin = $state<PressOrigin | null>(null);

	#node: HTMLElement | null = null;
	#pointer: number | null = null;
	#down = false;

	constructor(options: PressDepthOptions | (() => PressDepthOptions) = {}) {
		this.#read = typeof options === 'function' ? options : () => options;

		$effect(() => {
			if (!this.#tracking) return;

			const contains = (event: PointerEvent) => {
				if (!this.#node) return false;
				const r = this.#node.getBoundingClientRect();
				return (
					event.clientX >= r.left &&
					event.clientX <= r.right &&
					event.clientY >= r.top &&
					event.clientY <= r.bottom
				);
			};

			const move = (event: PointerEvent) => {
				if (event.pointerId !== this.#pointer) return;
				this.#setDown(contains(event));
			};
			const lift = (event: PointerEvent) => {
				if (event.pointerId !== this.#pointer) return;
				this.#stop();
			};
			const bail = () => this.#stop();
			const hidden = () => {
				if (document.hidden) this.#stop();
			};

			const windowPointerMoveEvent = on(window, 'pointermove', move);
			const windowPointerUpEvent = on(window, 'pointerup', lift);
			const windowPointerCancelEvent = on(window, 'pointercancel', lift);
			const windowBlurEvent = on(window, 'blur', bail);
			const visibilityChangeEvent = on(document, 'visibilitychange', hidden);

			return () => {
				windowPointerMoveEvent();
				windowPointerUpEvent();
				windowPointerCancelEvent();
				windowBlurEvent();
				visibilityChangeEvent();
			};
		});

		$effect(() => {
			if (this.#read().disabled) this.#stop();
		});
	}

	get pressed() {
		return this.#pressed;
	}

	get origin() {
		return this.#origin;
	}

	#setDown(next: boolean) {
		if (this.#down === next) return;
		this.#down = next;
		this.#pressed = next;
		if (next) this.#read().onPressStart?.();
		else this.#read().onPressEnd?.();
	}

	#stop() {
		this.#pointer = null;
		this.#tracking = false;
		this.#origin = null;
		this.#setDown(false);
	}

	#attach: Attachment<HTMLElement> = (element) => {
		this.#node = element;
		return () => {
			this.#node = null;
		};
	};

	props = $derived.by(() => {
		return {
			onpointerdown: (event: PointerEvent) => {
				if (this.#read().disabled) return;
				if (event.pointerType === 'mouse' && event.button !== 0) return;

				const target = event.currentTarget;
				const box = this.#node ?? (target instanceof HTMLElement ? target : null);
				if (box) {
					const r = box.getBoundingClientRect();
					this.#origin = {
						x: clamp(((event.clientX - r.left) / r.width) * 2 - 1),
						y: clamp(((event.clientY - r.top) / r.height) * 2 - 1)
					};
				}

				this.#pointer = event.pointerId;
				this.#tracking = true;
				this.#setDown(true);
			},
			onkeydown: (event: KeyboardEvent) => {
				if (this.#read().disabled || event.repeat) return;
				if (event.key === ' ' || event.key === 'Enter') this.#setDown(true);
			},
			onkeyup: (event: KeyboardEvent) => {
				if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') {
					this.#setDown(false);
				}
			},
			onblur: () => this.#stop(),
			[createAttachmentKey()]: this.#attach
		} satisfies HTMLAttributes<HTMLElement>;
	});
}

function clamp(n: number) {
	return Math.max(-1, Math.min(1, n));
}
