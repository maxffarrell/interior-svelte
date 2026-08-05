<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	export type SwipeChoice = 'left' | 'right';
	export type Props<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items: readonly T[];
		itemKey: (item: T) => string;
		itemLabel: (item: T) => string;
		children: Snippet<[T]>;
		onDecide?: (item: T, choice: SwipeChoice) => void;
		onUndo?: (item: T) => void;
		label?: string;
		leftLabel?: string;
		rightLabel?: string;
		undoLabel?: string;
		emptyLabel?: string;
		height?: number;
		threshold?: number;
		steps?: number;
		peek?: number;
	};
</script>

<script lang="ts" generics="T">
	// @ts-nocheck
	import { motion, useMotionValue, useTransform, animate } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const DISCLOSE = { type: 'spring', stiffness: 150, damping: 27, mass: 1 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const LEAVE = { duration: 0.3, ease: [0.4, 0, 1, 1] } as const;
	const INSTANT = { duration: 0 } as const;

	let { items, itemKey, itemLabel, children, onDecide, onUndo, label = 'Card deck', leftLabel = 'Skip', rightLabel = 'Keep', undoLabel = 'Undo', emptyLabel = 'Deck cleared', height = 180, threshold = 92, steps = 6, peek = 3, class: className, ...rest }: Props<T> = $props();
	let decisions = $state<SwipeChoice[]>([]);
	let leaving = $state<{ item: T; choice: SwipeChoice; from: number } | null>(null);
	let flow = $state<{ dir: -1 | 1; kind: 'decide' | 'undo' }>({ dir: 1, kind: 'decide' });
	let dragX = useMotionValue(0);
	const rotate = useTransform(dragX, [-200, 0, 200], [-8, 0, 8], { clamp: false });
	const opacity = useTransform(dragX, [-340, -150, 0, 150, 340], [0, 1, 1, 1, 0]);
	let startX = 0;
	let startTime = 0;
	let held = false;
	let card: HTMLDivElement | null = null;
	let intent = $state<{ dir: -1 | 0 | 1; step: number }>({ dir: 0, step: 0 });
	const grain = $derived(Math.max(1, Math.floor(steps)));
	const reach = $derived(Math.max(1, threshold));
	const index = $derived(Math.min(decisions.length, items.length));
	const current = $derived(items[index]);
	const stack = $derived(items.slice(index, index + Math.max(1, peek)));
	const done = $derived(index >= items.length);
	const reduced = $derived(reducedMotion.current);

	function report(dx: number) {
		const step = Math.min(grain, Math.round((Math.abs(dx) / reach) * grain));
		intent = { dir: step === 0 ? 0 : dx > 0 ? 1 : -1, step };
	}

	function decide(choice: SwipeChoice) {
		if (done || leaving) return;
		const item = items[index];
		if (item === undefined) return;
		const from = dragX.get();
		flow = { dir: choice === 'right' ? 1 : -1, kind: 'decide' };
		leaving = { item, choice, from };
		decisions = [...decisions, choice];
		intent = { dir: 0, step: 0 };
		dragX.set(0);
		onDecide?.(item, choice);
		setTimeout(() => (leaving = null), reduced ? 0 : 300);
	}

	function release(dx: number, velocity: number) {
		held = false;
		const far = Math.abs(dx) >= reach;
		const fast = Math.abs(velocity) >= 520 && Math.abs(dx) >= reach * 0.35;
		if (far || fast) decide((far ? dx : velocity) > 0 ? 'right' : 'left');
		else {
			animate(dragX, 0, reduced ? INSTANT : DISCLOSE);
			intent = { dir: 0, step: 0 };
		}
	}

	function pointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (done || leaving || (event.pointerType === 'mouse' && event.button !== 0)) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		held = true;
		startX = event.clientX;
		startTime = performance.now();
		dragX.set(0);
	}
	function pointermove(event: PointerEvent) {
		if (!held) return;
		const dx = event.clientX - startX;
		dragX.set(dx);
		report(dx);
	}
	function pointerup(event: PointerEvent) {
		if (!held) return;
		const dx = event.clientX - startX;
		const velocity = (dx / Math.max(1, performance.now() - startTime)) * 1000;
		release(dx, velocity);
	}
	function keydown(event: KeyboardEvent) {
		if (event.target !== event.currentTarget) return;
		if (event.key === 'ArrowLeft') { event.preventDefault(); decide('left'); }
		else if (event.key === 'ArrowRight') { event.preventDefault(); decide('right'); }
		else if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); undo(); }
		else if (event.key === 'Escape') intent = { dir: 0, step: 0 };
	}
	function undo() {
		if (!decisions.length || leaving) return;
		const item = items[index - 1];
		if (!item) return;
		const last = decisions.at(-1)!;
		flow = { dir: last === 'right' ? 1 : -1, kind: 'undo' };
		decisions = decisions.slice(0, -1);
		onUndo?.(item);
		dragX.set(reduced ? 0 : flow.dir * 560);
		if (!reduced) queueMicrotask(() => animate(dragX, 0, DISCLOSE));
	}
	$effect(() => {
		const bail = () => { held = false; intent = { dir: 0, step: 0 }; animate(dragX, 0, reduced ? INSTANT : DISCLOSE); };
		const hidden = () => document.hidden && bail();
		window.addEventListener('blur', bail);
		document.addEventListener('visibilitychange', hidden);
		return () => { window.removeEventListener('blur', bail); document.removeEventListener('visibilitychange', hidden); };
	});
</script>

<div {...rest} class={cn('w-full', className)}>
	<div role="group" aria-label={label} tabindex="0" onkeydown={keydown} style="height:{height + 26}px" class="relative w-full overflow-hidden rounded-[14px] outline-none focus-visible:shadow-[0_0_0_1px_theme(colors.accent)]">
		<div class="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20px,black_calc(100%-20px),transparent)]">
			<motion.div aria-hidden={!done} animate={{ opacity: done ? 1 : 0 }} transition={reduced ? INSTANT : CROSSFADE} style="height:{height}px" class="absolute inset-x-5 top-0 z-0 grid place-items-center rounded-[14px] bg-well px-4 text-center text-[12.5px] text-ink-3">{emptyLabel}</motion.div>
			{#each stack as item, depth (itemKey(item))}
				{@const active = depth === 0}
				{@const commit = depth === 1 ? intent.step / grain : 0}
				{@const cardY = depth * 10 - commit * 10}
				{@const cardScale = 1 - depth * 0.045 + commit * 0.045}
				<motion.div
					role="group"
					aria-label={itemLabel(item)}
					aria-hidden={!active}
					inert={!active}
					bind:this={card}
					onpointerdown={active ? pointerdown : undefined}
					onpointermove={active ? pointermove : undefined}
					onpointerup={active ? pointerup : undefined}
					onpointercancel={active ? () => release(0, 0) : undefined}
					initial={{ y: cardY, scale: cardScale }}
					animate={{ y: cardY, scale: held && active && !reduced ? 1.03 : cardScale }}
					transition={reduced ? INSTANT : active ? { ...CROSSFADE, delay: 0.1 } : CROSSFADE}
					style={`z-index:${10 - depth};height:${height}px;transform-origin:50% 100%;touch-action:pan-y`}
					class={cn('absolute inset-x-5 top-0 select-none overflow-hidden rounded-[14px] border border-hairline bg-panel', active ? 'z-10 cursor-grab touch-pan-y shadow-[0_1px_2px_rgba(28,25,23,0.06),0_16px_32px_-18px_rgba(28,25,23,0.55)] active:cursor-grabbing' : 'shadow-[0_1px_2px_rgba(28,25,23,0.05),0_6px_14px_-12px_rgba(28,25,23,0.4)]')}
				>
					{#if active}<motion.div style={{ x: dragX, rotate, opacity }} animate={{ height }} transition={reduced ? INSTANT : CROSSFADE} class="absolute inset-0 rounded-[14px]">{@render children(item)}</motion.div>{:else}{@render children(item)}{/if}
					{#if active}<motion.span aria-hidden animate={{ opacity: intent.dir === -1 ? intent.step / grain : 0, scale: intent.dir === -1 ? 1 : 0.94 }} transition={reduced ? INSTANT : CELL} class={cn('pointer-events-none absolute top-3 left-3 whitespace-nowrap rounded-[6px] border bg-panel px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]', intent.step >= grain && intent.dir === -1 ? 'border-flag text-flag' : 'border-hairline text-ink-2')}>{leftLabel}</motion.span><motion.span aria-hidden animate={{ opacity: intent.dir === 1 ? intent.step / grain : 0, scale: intent.dir === 1 ? 1 : 0.94 }} transition={reduced ? INSTANT : CELL} class={cn('pointer-events-none absolute top-3 right-3 whitespace-nowrap rounded-[6px] border bg-panel px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]', intent.step >= grain && intent.dir === 1 ? 'border-moss text-moss' : 'border-hairline text-ink-2')}>{rightLabel}</motion.span>{/if}
				</motion.div>
			{/each}
			{#if leaving}<motion.div initial={{ x: leaving.from, rotate: leaving.from / 25, opacity: 1 }} animate={{ x: leaving.choice === 'right' ? 560 : -560, rotate: leaving.choice === 'right' ? 22.4 : -22.4, opacity: 0, borderColor: 'rgba(0,0,0,0)' }} transition={reduced ? INSTANT : { x: LEAVE, rotate: LEAVE, opacity: LEAVE, borderColor: { duration: 0.1, ease: 'linear' } }} class="absolute inset-x-5 top-0 z-20 overflow-hidden rounded-[14px] border border-hairline bg-panel" style="height:{height}px;transform-origin:50% 100%">{@render children(leaving.item)}</motion.div>{/if}
		</div>
	</div>
	<div class="mt-3 grid h-8 grid-cols-[1fr_auto_1fr] items-center gap-3">
		<button type="button" disabled={done || !!leaving} onclick={() => decide('left')} class="inline-flex h-8 items-center gap-1.5 justify-self-start rounded-[9px] border border-hairline bg-panel px-2.5 text-[12px] font-medium text-ink-2 disabled:opacity-0">✕ <span>{leftLabel}</span></button>
		<span class="flex items-center gap-2 font-mono text-[10.5px] tabular-nums text-ink-3"><span>{Math.max(0, items.length - index)}</span><span aria-hidden>left</span><button type="button" disabled={!decisions.length || !!leaving} onclick={undo} class="inline-flex items-center gap-1 rounded-[5px] px-1 py-0.5 text-ink-2 hover:bg-well disabled:opacity-0">↶ <span>{undoLabel}</span></button></span>
		<button type="button" disabled={done || !!leaving} onclick={() => decide('right')} class="inline-flex h-8 items-center gap-1.5 justify-self-end rounded-[9px] border border-hairline bg-panel px-2.5 text-[12px] font-medium text-ink-2 disabled:opacity-0"><span>{rightLabel}</span> ✓</button>
	</div>
	<p aria-live="polite" aria-atomic class="sr-only">{done || !current ? emptyLabel : `${itemLabel(current)}. Card ${index + 1} of ${items.length}.`}</p>
	<span class="sr-only">Left and right arrow keys decide the top card. Backspace brings the last one back.</span>
</div>
