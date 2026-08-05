<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		open: boolean;
		onClose: () => void;
		src: string;
		alt: string;
		originRef?: HTMLElement | null;
		caption?: string;
		width?: number;
		height?: number;
		maxScale?: number;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { animate, motion, useMotionValue } from 'motion-sv';
	import { fade } from 'svelte/transition';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const HOME = { type: 'spring', stiffness: 150, damping: 27, mass: 1 } as const;
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const INSTANT = { duration: 0 } as const;
	const TOGGLE = 2.5;
	const KEY_ZOOM = 1.6;
	const KEY_PAN = 56;
	const WHEEL_RATE = 140;
	const SLOP = 8;
	const NEAR_HOME = 1.02;
	const SNAP_HOME = 1.05;

	let { open, onClose, src, alt, originRef = null, caption, width, height, maxScale = 4, class: className, ...rest }: Props = $props();
	let frame: HTMLDivElement | null = null;
	let image: HTMLImageElement | null = null;
	let previousFocus: HTMLElement | null = null;
	let zoomStep = $state(0);
	let settledStep = $state(0);
	let drag: { id: number; x: number; y: number; startX: number; startY: number } | null = null;
	let onImage = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	const scale = useMotionValue(1);
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const borderRadius = useMotionValue(14);
	const steps = $derived(Math.max(1, Math.round(8)));
	const top = $derived(Math.max(1.1, maxScale));
	const zoom = $derived(1 + (zoomStep / steps) * (top - 1));
	const zoomed = $derived(zoomStep > 0);

	function clamp(value: number, low: number, high: number) { return Math.min(high, Math.max(low, value)); }
	function stepFor(value: number) { return clamp(Math.round(((value - 1) / (top - 1)) * steps), 0, steps); }
	function mark(value: number) { zoomStep = stepFor(value); }
	function bounds(s: number) {
		if (!frame || !image) return { mx: 0, my: 0 };
		return { mx: Math.max(0, (image.offsetWidth * s - frame.clientWidth) / 2), my: Math.max(0, (image.offsetHeight * s - frame.clientHeight) / 2) };
	}
	function place(s: number, nx: number, ny: number) {
		const { mx, my } = bounds(s);
		scale.set(s); x.set(clamp(nx, -mx, mx)); y.set(clamp(ny, -my, my)); mark(s);
	}
	function settle(value: number) {
		if (timer) clearTimeout(timer);
		timer = undefined;
		settledStep = stepFor(value);
	}
	function settleSoon(value: number) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => settle(value), 220);
	}
	function glide(s: number, nx: number, ny: number, spring = CELL) {
		const { mx, my } = bounds(s);
		const tx = clamp(nx, -mx, mx); const ty = clamp(ny, -my, my);
		if (reducedMotion.current) { scale.set(s); x.set(tx); y.set(ty); }
		else { animate(scale, s, spring); animate(x, tx, spring); animate(y, ty, spring); }
		mark(s); settle(s);
	}
	function reset() { glide(1, 0, 0, HOME); }
	function zoomAt(next: number, cx: number, cy: number, animated = true) {
		if (!frame) return;
		const rect = frame.getBoundingClientRect();
		const px = cx - (rect.left + rect.width / 2); const py = cy - (rect.top + rect.height / 2);
		const s0 = scale.get(); const ax = (px - x.get()) / s0; const ay = (py - y.get()) / s0; const s = clamp(next, 1, top);
		const nx = px - ax * s; const ny = py - ay * s;
		if (animated) glide(s, nx, ny, s <= 1 ? HOME : CELL); else { place(s, nx, ny); settleSoon(s); }
	}
	function finish() { if (scale.get() < SNAP_HOME) reset(); else settle(scale.get()); }
	function pointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (!open || (event.pointerType === 'mouse' && event.button !== 0)) return;
		onImage = !!image?.contains(event.target as Node);
		event.currentTarget.setPointerCapture(event.pointerId);
		drag = { id: event.pointerId, x: x.get(), y: y.get(), startX: event.clientX, startY: event.clientY };
	}
	function pointermove(event: PointerEvent) {
		if (!drag || drag.id !== event.pointerId || scale.get() <= 1) return;
		place(scale.get(), drag.x + event.clientX - drag.startX, drag.y + event.clientY - drag.startY);
	}
	function pointerup(event: PointerEvent) {
		if (!drag || drag.id !== event.pointerId) return;
		const moved = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY); drag = null;
		if (moved < SLOP && !onImage && scale.get() <= NEAR_HOME) onClose(); else finish();
	}
	function pointercancel() { if (drag) { drag = null; finish(); } }
	function keydown(event: KeyboardEvent) {
		if (!frame) return;
		const rect = frame.getBoundingClientRect(); const cx = rect.left + rect.width / 2; const cy = rect.top + rect.height / 2; const current = scale.get();
		if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomAt(current * KEY_ZOOM, cx, cy); }
		else if (event.key === '-' || event.key === '_') { event.preventDefault(); zoomAt(current / KEY_ZOOM, cx, cy); }
		else if (event.key === '0') { event.preventDefault(); reset(); }
		else if (event.key === 'Escape' && current > NEAR_HOME) { event.preventDefault(); reset(); }
		else if (current > NEAR_HOME && event.key.startsWith('Arrow')) { event.preventDefault(); glide(current, x.get() + (event.key === 'ArrowLeft' ? KEY_PAN : event.key === 'ArrowRight' ? -KEY_PAN : 0), y.get() + (event.key === 'ArrowUp' ? KEY_PAN : event.key === 'ArrowDown' ? -KEY_PAN : 0)); }
		else if (event.key === 'Escape') { event.preventDefault(); onClose(); }
	}
	function doubleclick(event: MouseEvent) { if (!open) return; zoomAt(scale.get() > SNAP_HOME ? 1 : Math.min(TOGGLE, top), event.clientX, event.clientY); }
	function toggleZoom() { if (!frame) return; if (zoomed) reset(); else { const rect = frame.getBoundingClientRect(); zoomAt(Math.min(TOGGLE, top), rect.left + rect.width / 2, rect.top + rect.height / 2); } }
	function chromeKeydown(event: KeyboardEvent) { if (event.key === 'Tab' && frame) { event.preventDefault(); const focusable = [...frame.closest('[role=dialog]')!.querySelectorAll<HTMLElement>('[data-lightbox-focus]')]; const at = focusable.indexOf(document.activeElement as HTMLElement); focusable[event.shiftKey ? (at <= 0 ? focusable.length - 1 : at - 1) : (at < 0 || at === focusable.length - 1 ? 0 : at + 1)]?.focus(); } }

	$effect(() => {
		if (!open) return;
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const body = document.body; const overflow = body.style.overflow; body.style.overflow = 'hidden';
		requestAnimationFrame(() => {
			if (originRef && image && frame && !reducedMotion.current) {
				const from = originRef.getBoundingClientRect();
				const to = image.getBoundingClientRect();
				const start = Math.max(0.05, Math.min(from.width / Math.max(1, to.width), from.height / Math.max(1, to.height)));
				x.set(from.left + from.width / 2 - (to.left + to.width / 2));
				y.set(from.top + from.height / 2 - (to.top + to.height / 2));
				scale.set(start);
				borderRadius.set(9);
				animate(x, 0, HOME); animate(y, 0, HOME); animate(scale, 1, HOME); animate(borderRadius, 14, HOME);
			}
			frame?.focus({ preventScroll: true });
		});
		return () => { body.style.overflow = overflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
	});
	$effect(() => {
		if (!open || !frame) return;
		const wheel = (event: WheelEvent) => { event.preventDefault(); zoomAt(scale.get() * Math.exp(-event.deltaY / WHEEL_RATE), event.clientX, event.clientY, false); };
		frame.addEventListener('wheel', wheel, { passive: false });
		return () => frame?.removeEventListener('wheel', wheel);
	});
	$effect(() => {
		if (open) return;
		scale.set(1); x.set(0); y.set(0); zoomStep = 0; settledStep = 0;
	});
</script>

{#if open}
	<div {...rest} role="dialog" aria-modal="true" aria-labelledby="lightbox-title" class={cn('fixed inset-0 z-50', className)} onkeydown={chromeKeydown} transition:fade={{ duration: reducedMotion.current ? 0 : 200 }}>
		<motion.div aria-hidden="true" initial={reducedMotion.current ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} class="absolute inset-0 bg-ink/80" transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }} />
		<div bind:this={frame} tabindex="-1" role="group" aria-labelledby="lightbox-title" aria-describedby="lightbox-hint" onpointerdown={pointerdown} onpointermove={pointermove} onpointerup={pointerup} onpointercancel={pointercancel} onlostpointercapture={pointercancel} ondblclick={doubleclick} onkeydown={keydown} style="touch-action:none;-webkit-touch-callout:none" class={cn('absolute inset-0 overflow-hidden outline-none select-none', zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in')}>
			<motion.div class="absolute inset-0 flex items-center justify-center p-4 sm:p-14" initial={reducedMotion.current ? false : { filter: 'blur(6px)' }} animate={{ filter: 'blur(0px)' }} transition={reducedMotion.current ? { duration: 0 } : { duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
				<motion.img bind:this={image} src={src} alt={alt} width={width} height={height} draggable="false" style={{ x, y, scale, borderRadius }} class="max-h-full max-w-full object-contain" />
			</motion.div>
		</div>
		<div class="pointer-events-none absolute inset-0 flex items-start justify-between gap-3 p-3 sm:p-4">
			<p id="lightbox-title" class="pointer-events-auto max-w-[65%] truncate rounded-[9px] border border-hairline bg-panel px-2.5 py-1.5 text-[12.5px] text-ink-2">{caption ?? alt}</p>
			<div class="pointer-events-auto flex items-center gap-2"><button data-lightbox-focus type="button" onclick={toggleZoom} aria-label={zoomed ? 'Zoom out' : 'Zoom in'} class="grid size-8 place-items-center rounded-[9px] border border-hairline bg-panel text-ink-3"><svg viewBox="0 0 256 256" class="size-[15px]" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"><circle cx="116" cy="116" r="84" /><path d="M175.4 175.4 224 224M84 116h64" /><motion.path d="M116 84v64" initial={false} animate={{ opacity: zoomed ? 0 : 1 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }} /></svg></button><button data-lightbox-focus type="button" onclick={onClose} aria-label="Close" class="grid size-8 place-items-center rounded-[9px] border border-hairline bg-panel text-ink-3"><svg viewBox="0 0 256 256" class="size-[15px]" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"><path d="M200 56 56 200M200 200 56 56" /></svg></button></div>
		</div>
		<p id="lightbox-hint" class="sr-only">Scroll to zoom toward the pointer, or press plus and minus. Drag or use the arrow keys to pan, and double-click to switch between fit and close-up. Press zero to return to the starting frame; Escape returns home first, then closes.</p>
		<p role="status" class="sr-only">Zoom {(1 + (settledStep / steps) * (top - 1)).toFixed(1)} times</p>
	</div>
{/if}
