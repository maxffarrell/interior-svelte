import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import type { HTMLButtonAttributes } from 'svelte/elements';
import { on } from 'svelte/events';

export type HoldPhase = 'idle' | 'holding' | 'releasing' | 'committed';

export type HoldToConfirmOptions = {
	onConfirm: () => void;
	onAbort?: () => void;
	duration?: number;
	steps?: number;
	releaseRate?: number;
	moveTolerance?: number;
	haptic?: boolean;
	disabled?: boolean;
};

export class HoldToConfirmState {
	#read: () => HoldToConfirmOptions;

	#phase = $state<HoldPhase>('idle');
	#step = $state(0);

	#down = false;
	#elapsed = 0;
	#last = 0;
	#raf = 0;
	#origin: { x: number; y: number } | null = null;

	constructor(options: HoldToConfirmOptions | (() => HoldToConfirmOptions)) {
		this.#read = typeof options === 'function' ? options : () => options;
	}

	get phase() {
		return this.#phase;
	}

	get step() {
		return this.#step;
	}

	get steps() {
		return this.#read().steps ?? 20;
	}

	get progress() {
		return this.#step / this.steps;
	}

	get committed() {
		return this.#phase === 'committed';
	}

	reset = () => {
		cancelAnimationFrame(this.#raf);
		this.#raf = 0;
		this.#down = false;
		this.#elapsed = 0;
		this.#origin = null;
		this.#step = 0;
		this.#phase = 'idle';
	};

	release = () => {
		if (this.#phase !== 'holding') return;
		this.#down = false;
		this.#origin = null;
		this.#phase = 'releasing';
		this.#read().onAbort?.();
	};

	#loop = (now: number) => {
		const { duration = 1800, releaseRate = 2.5, haptic = true } = this.#read();
		const steps = this.steps;

		const dt = Math.min(64, Math.max(0, now - this.#last));
		this.#last = now;
		this.#elapsed += this.#down ? dt : -dt * releaseRate;

		if (this.#elapsed >= duration) {
			this.#raf = 0;
			this.#elapsed = duration;
			this.#down = false;
			this.#origin = null;
			this.#step = steps;
			this.#phase = 'committed';
			if (haptic) navigator.vibrate?.(14);
			this.#read().onConfirm();
			return;
		}

		if (!this.#down && this.#elapsed <= 0) {
			this.#raf = 0;
			this.#elapsed = 0;
			this.#origin = null;
			this.#step = 0;
			this.#phase = 'idle';
			return;
		}

		const next = Math.min(steps, Math.floor((this.#elapsed / duration) * steps));
		if (this.#step !== next) this.#step = next;
		this.#raf = requestAnimationFrame(this.#loop);
	};

	#begin = (point?: { x: number; y: number }) => {
		if (this.#read().disabled) return;
		if (this.#phase === 'committed' || this.#phase === 'holding') return;

		this.#origin = point ?? null;
		this.#down = true;
		this.#phase = 'holding';
		if (this.#raf) return;

		this.#last = performance.now();
		this.#raf = requestAnimationFrame(this.#loop);
	};

	#attach: Attachment<HTMLElement> = () => {
		const bail = () => this.release();
		const onVisibility = () => {
			if (document.hidden) {
				this.release();
			}
		};

		const windowBlurEvent = on(window, 'blur', bail);
		const visibilityChangeEvent = on(document, 'visibilitychange', onVisibility);

		return () => {
			windowBlurEvent();
			visibilityChangeEvent();
			cancelAnimationFrame(this.#raf);
			this.#raf = 0;
		};
	};

	readonly props = $derived.by(() => {
		return {
			onpointerdown: (event: PointerEvent & { currentTarget: EventTarget & HTMLElement }) => {
				if (event.pointerType === 'mouse' && event.button !== 0) return;
				event.currentTarget.setPointerCapture?.(event.pointerId);
				this.#begin({ x: event.clientX, y: event.clientY });
			},
			onpointermove: (event: PointerEvent) => {
				const from = this.#origin;
				if (this.#phase !== 'holding' || !from) return;
				const { moveTolerance = 10 } = this.#read();
				if (Math.hypot(event.clientX - from.x, event.clientY - from.y) > moveTolerance) {
					this.release();
				}
			},
			onpointerup: () => this.release(),
			onpointercancel: () => this.release(),
			onlostpointercapture: () => this.release(),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					if (this.#phase === 'holding' || this.#phase === 'releasing') {
						event.preventDefault();
						this.reset();
					}
					return;
				}
				if (event.repeat) return;
				if (event.key === ' ' || event.key === 'Enter') {
					event.preventDefault();
					this.#begin();
				}
			},
			onkeyup: (event: KeyboardEvent) => {
				if (event.key === ' ' || event.key === 'Enter') this.release();
			},
			onblur: () => this.release(),
			onclick: (event: MouseEvent) => {
				event.preventDefault();
				if (this.#phase === 'committed') event.stopPropagation();
			},
			oncontextmenu: (event: MouseEvent) => event.preventDefault(),
			[createAttachmentKey()]: this.#attach
		} satisfies HTMLButtonAttributes;
	});
}
