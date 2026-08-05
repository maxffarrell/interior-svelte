<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	export type Props = Omit<HTMLButtonAttributes, 'children'> & {
		onLongPress: () => void;
		children: Snippet;
		duration?: number;
		steps?: number;
		moveTolerance?: number;
		haptic?: boolean;
		onCancel?: () => void;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	let { onLongPress, children, duration = 550, steps = 12, moveTolerance = 8, haptic = true, onCancel, disabled = false, class: className }: Props = $props();
	const cells = $derived(Math.max(1, Math.round(steps)));
	let step = $state(0);
	let holding = $state(false);
	let fired = $state(false);
	let phase: 'idle' | 'holding' | 'fired' = 'idle';
	let origin: { x: number; y: number } | null = null;
	let raf = 0;
	let startedAt = 0;
	let settle: ReturnType<typeof setTimeout> | undefined;
	const id = $props.id();

	function reset() {
		cancelAnimationFrame(raf);
		raf = 0;
		if (settle) clearTimeout(settle);
		settle = undefined;
		origin = null;
		phase = 'idle';
		holding = false;
		fired = false;
		step = 0;
	}
	function end() {
		if (phase !== 'holding') return;
		reset();
		onCancel?.();
	}
	function begin(point?: { x: number; y: number }) {
		if (disabled || phase !== 'idle') return;
		phase = 'holding';
		holding = true;
		origin = point ?? null;
		startedAt = performance.now();
		const tick = (now: number) => {
			const progress = Math.min(1, (now - startedAt) / duration);
			step = Math.floor(progress * cells);
			if (progress < 1) { raf = requestAnimationFrame(tick); return; }
			raf = 0;
			phase = 'fired';
			holding = false;
			fired = true;
			step = cells;
			if (haptic) navigator.vibrate?.(12);
			onLongPress();
			settle = setTimeout(() => { if (phase === 'fired') reset(); }, 260);
		};
		raf = requestAnimationFrame(tick);
	}
	function pointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		begin({ x: event.clientX, y: event.clientY });
	}
	function pointermove(event: PointerEvent) {
		if (phase !== 'holding' || !origin) return;
		if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > moveTolerance) end();
	}
	function keydown(event: KeyboardEvent) {
		if (event.repeat) return;
		if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); begin(); }
	}
	function keyup(event: KeyboardEvent) {
		if (event.key === ' ' || event.key === 'Enter' || event.key === 'Escape') end();
	}
	function click(event: MouseEvent) {
		if (phase === 'fired' || fired) { event.preventDefault(); event.stopPropagation(); }
	}
	$effect(() => {
		const bail = () => end();
		const hidden = () => document.hidden && end();
		window.addEventListener('blur', bail);
		document.addEventListener('visibilitychange', hidden);
		return () => { window.removeEventListener('blur', bail); document.removeEventListener('visibilitychange', hidden); cancelAnimationFrame(raf); if (settle) clearTimeout(settle); };
	});
</script>

<button type="button" aria-disabled={disabled || undefined} aria-describedby={id} onpointerdown={pointerdown} onpointermove={pointermove} onpointerup={end} onpointercancel={end} onpointerleave={end} onkeydown={keydown} onkeyup={keyup} onblur={end} onclick={click} oncontextmenu={(event) => event.preventDefault()} class={cn('group relative inline-flex h-9 select-none items-center rounded-[9px] border px-3.5 text-[13px] font-medium outline-none transition-[border-color,background-color,box-shadow,transform] duration-150 focus-visible:border-accent', holding ? 'translate-y-px mat-well' : fired ? 'border-accent bg-accent/7' : 'mat-cap', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', className)} style="touch-action:manipulation;-webkit-touch-callout:none">
	<span class="relative grid"><span class="col-start-1 row-start-1 whitespace-nowrap text-ink-2">{@render children()}</span><motion.span aria-hidden initial={false} animate={{ clipPath: `inset(0 ${((1 - step / cells) * 100).toFixed(2)}% 0 0)` }} transition={reducedMotion.current ? INSTANT : CELL} class="col-start-1 row-start-1 whitespace-nowrap text-accent">{@render children()}</motion.span></span>
	<span id={id} class="sr-only">Press and hold for {Math.round(duration / 100) / 10} seconds to confirm</span>
</button>
