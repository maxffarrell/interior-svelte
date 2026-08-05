<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type Props = { children: Snippet; label: Snippet; side?: 'top' | 'bottom'; disabled?: boolean; openDelay?: number; closeDelay?: number; class?: string; contentClass?: string };
</script>
<script lang="ts">
	// @ts-nocheck
	import { getContext, onDestroy } from 'svelte';
	import { AnimatePresence, motion } from 'motion-sv';
	import { TOOLTIP_GROUP_KEY, type TooltipGroupStore } from './tooltip-group.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { children, label, side = 'top', disabled = false, openDelay = 200, closeDelay = 120, class: className = '', contentClass = '' }: Props = $props();
	let open = $state(false);
	let skipped = $state(false);
	let travel = $state(0);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const id = `tooltip-${Math.random().toString(36).slice(2)}`;
	const store = getContext<TooltipGroupStore | undefined>(TOOLTIP_GROUP_KEY);
	const unsubscribe = store?.subscribe(() => {
		open = store.getActive() === id;
		skipped = store.getSkipped();
		travel = store.getTravel();
	});
	onDestroy(() => unsubscribe?.());
	function show(immediate = false, x?: number) {
		if (disabled) return;
		if (store) store.open(id, immediate, x);
		else { clearTimeout(timer); clearTimeout(closeTimer); if (immediate) open = true; else timer = setTimeout(() => (open = true), openDelay); }
	}
	function hide(immediate = false) {
		store?.unblock(id);
		if (store) store.close(id, immediate);
		else { clearTimeout(timer); if (immediate) open = false; else closeTimer = setTimeout(() => (open = false), closeDelay); }
	}
</script>
<span class="relative inline-flex {className}" aria-describedby={open ? id : undefined} onpointerenter={(event) => show(false, event.clientX)} onpointerleave={() => hide(false)} onpointerdown={() => store ? store.dismiss(id) : (open = false)} onpointercancel={() => hide(true)} onfocusin={(event) => { try { if (event.currentTarget.matches(':focus-visible')) show(true); } catch { show(true); } }} onfocusout={() => hide(true)} onkeydown={(event) => event.key === 'Escape' && (store ? store.dismiss(id) : (open = false))}>
	{@render children()}
	<span aria-hidden={!open} class="pointer-events-none absolute left-1/2 z-50 flex w-0 justify-center {side === 'top' ? 'bottom-[calc(100%+7px)]' : 'top-[calc(100%+7px)]'}">
		<AnimatePresence>
				{#if open}<motion.span role="tooltip" id={id} initial={reducedMotion.current ? false : skipped ? { opacity: 0, scale: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, scale: 0.9, y: side === 'top' ? 7 : -7, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }} exit={reducedMotion.current ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.96, y: side === 'top' ? 2.45 : -2.45, filter: 'blur(2px)', transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } }} transition={reducedMotion.current ? { duration: 0 } : skipped ? { type: 'spring', stiffness: 900, damping: 48, mass: 0.5 } : { type: 'spring', stiffness: 560, damping: 34, mass: 0.6 }} class="relative w-max max-w-[220px] shrink-0 overflow-hidden rounded-[8px] px-2 py-1 text-[11.5px] font-medium leading-snug text-stone-700 dark:text-stone-100 {contentClass}"><span aria-hidden class="absolute inset-0 rounded-[8px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_6px_16px_-12px_rgba(28,25,23,0.35)] dark:border-white/[0.16] dark:bg-[#1D1D1A]" /><motion.span initial={reducedMotion.current ? false : skipped ? { opacity: 0, x: travel * 14, y: 0 } : { opacity: 0, x: 0, y: 9 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 44, mass: 0.5 }} class="relative block whitespace-nowrap">{@render label()}</motion.span></motion.span>{/if}
		</AnimatePresence>
	</span>
</span>
