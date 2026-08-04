<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
	export type PopoverAlign = 'start' | 'center' | 'end';
	export type PopoverProps = {
		trigger: Snippet;
		children: Snippet;
		label: string;
		open?: boolean;
		defaultOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
		side?: PopoverSide;
		align?: PopoverAlign;
		offset?: number;
		padding?: number;
		arrowSize?: number;
		boundary?: HTMLElement | null;
		triggerClass?: string;
		class?: string;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const EASE = [0.23, 1, 0.32, 1] as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const FLIP: Record<PopoverSide, PopoverSide> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
	const FROM: Record<PopoverSide, { x?: number; y?: number }> = { top: { y: 6 }, bottom: { y: -6 }, left: { x: 6 }, right: { x: -6 } };
	const ARROW: Record<PopoverSide, string> = { bottom: 'border-t border-l', top: 'border-b border-r', right: 'border-b border-l', left: 'border-t border-r' };

	let {
		trigger,
		children,
		label,
		open: controlled = $bindable(),
		defaultOpen = false,
		onOpenChange,
		side = 'bottom',
		align = 'center',
		offset = 10,
		padding = 8,
		arrowSize = 9,
		boundary = null,
		triggerClass = '',
		class: className = ''
	}: PopoverProps = $props();

	let internal = $state(defaultOpen);
	let isOpen = $derived(controlled ?? internal);
	let anchor = $state<HTMLButtonElement | null>(null);
	let floating = $state<HTMLDivElement | null>(null);
	let panel = $state<HTMLDivElement | null>(null);
	let content = $state<HTMLDivElement | null>(null);
	let arrow = $state<HTMLSpanElement | null>(null);
	let resolved = $state<PopoverSide>(side);
	const id = $props.id();

	function setOpen(next: boolean) {
		if (controlled === undefined) internal = next;
		controlled = next;
		onOpenChange?.(next);
	}

	function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), Math.max(min, max)); }

	function update() {
		if (!anchor || !floating || !panel) return;
		const a = anchor.getBoundingClientRect();
		const b = boundary?.getBoundingClientRect();
		const vw = document.documentElement.clientWidth;
		const vh = document.documentElement.clientHeight;
		const left = b ? Math.max(padding, b.left + padding) : padding;
		const top = b ? Math.max(padding, b.top + padding) : padding;
		const right = b ? Math.min(vw - padding, b.right - padding) : vw - padding;
		const bottom = b ? Math.min(vh - padding, b.bottom - padding) : vh - padding;
		panel.style.maxWidth = `${Math.max(160, right - left)}px`;
		const room = { top: a.top - top - offset, bottom: bottom - a.bottom - offset, left: a.left - left - offset, right: right - a.right - offset } as Record<PopoverSide, number>;
		let next = side;
		const wanted = next === 'top' || next === 'bottom' ? panel.offsetHeight : panel.offsetWidth;
		if (room[next] < wanted && room[FLIP[next]] > room[next]) next = FLIP[next];
		const horizontal = next === 'top' || next === 'bottom';
		if (!horizontal) panel.style.maxWidth = `${Math.max(160, Math.min(right - left, room[next]))}px`;
		if (content) {
			const chrome = panel.offsetHeight - content.offsetHeight;
			content.style.maxHeight = `${Math.max(88, (horizontal ? room[next] : bottom - top) - chrome)}px`;
		}
		const w = panel.offsetWidth;
		const h = panel.offsetHeight;
		let x = horizontal ? (align === 'start' ? a.left : align === 'end' ? a.right - w : a.left + (a.width - w) / 2) : next === 'left' ? a.left - offset - w : a.right + offset;
		let y = horizontal ? (next === 'top' ? a.top - offset - h : a.bottom + offset) : (align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + (a.height - h) / 2);
		x = clamp(x, left, right - w);
		y = clamp(y, top, bottom - h);
		floating.style.left = `${Math.round(x)}px`;
		floating.style.top = `${Math.round(y)}px`;
		const half = arrowSize / 2;
		const point = horizontal ? clamp(a.left + a.width / 2 - x, 11 + half, w - 11 - half) : clamp(a.top + a.height / 2 - y, 11 + half, h - 11 - half);
		panel.style.transformOrigin = horizontal ? `${point}px ${next === 'top' ? h : 0}px` : `${next === 'left' ? w : 0}px ${point}px`;
		if (arrow) {
			if (horizontal) { arrow.style.left = `${point - half}px`; arrow.style.top = `${next === 'top' ? h - half : -half}px`; }
			else { arrow.style.top = `${point - half}px`; arrow.style.left = `${next === 'left' ? w - half : -half}px`; }
		}
		resolved = next;
	}

	$effect(() => {
		if (!isOpen) return;
		const frame = requestAnimationFrame(update);
		const schedule = () => requestAnimationFrame(update);
		const observer = new ResizeObserver(schedule);
		if (anchor) observer.observe(anchor);
		if (content) observer.observe(content);
		window.addEventListener('resize', schedule);
		window.addEventListener('scroll', schedule, true);
		return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', schedule); window.removeEventListener('scroll', schedule, true); };
	});

	$effect(() => {
		if (!isOpen) return;
		panel?.focus({ preventScroll: true });
		const outside = (event: PointerEvent) => { const target = event.target as Node; if (!panel?.contains(target) && !anchor?.contains(target)) setOpen(false); };
		const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); anchor?.focus({ preventScroll: true }); setOpen(false); } };
		document.addEventListener('pointerdown', outside, true);
		document.addEventListener('keydown', escape, true);
		return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape, true); };
	});
</script>

<button bind:this={anchor} type="button" aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={isOpen ? id : undefined} onclick={() => setOpen(!isOpen)} class="inline-flex h-9 select-none items-center gap-2 rounded-[9px] border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-700 outline-none transition-[border-color,box-shadow] duration-150 hover:border-stone-300 focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200 {triggerClass}">
	{@render trigger()}
</button>

<AnimatePresence>
	{#if isOpen}
		<div bind:this={floating} class="fixed left-0 top-0 z-50" onblur={(event) => { const next = event.relatedTarget as Node | null; if (next && !panel?.contains(next) && !anchor?.contains(next)) setOpen(false); }}>
			<motion.div bind:this={panel} id={id} role="dialog" aria-label={label} tabindex="-1" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.95, ...FROM[resolved] }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.13, ease: EASE } }} transition={reducedMotion.current ? { duration: 0 } : { ...CROSSFADE, opacity: { duration: 0.14, ease: EASE } }} class="relative rounded-[11px] border border-stone-200 bg-white p-3 shadow-[0_18px_40px_-24px_rgba(28,25,23,0.5)] focus-visible:outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] {className}">
				<span bind:this={arrow} aria-hidden style:width={arrowSize + 'px'} style:height={arrowSize + 'px'} class="absolute block rotate-45 bg-white dark:bg-[#1D1D1A] {ARROW[resolved]}" />
				<div bind:this={content} class="relative overflow-y-auto overscroll-contain">{@render children()}</div>
			</motion.div>
		</div>
	{/if}
</AnimatePresence>
