<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type Props = { children: Snippet; label: Snippet; side?: 'top' | 'bottom'; disabled?: boolean; openDelay?: number; closeDelay?: number; class?: string; contentClass?: string };
</script>
<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { children, label, side = 'top', disabled = false, openDelay = 200, closeDelay = 120, class: className = '', contentClass = '' }: Props = $props();
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;
	const id = `tooltip-${Math.random().toString(36).slice(2)}`;
	function show(immediate = false) { if (disabled) return; clearTimeout(timer); clearTimeout(closeTimer); if (immediate) open = true; else timer = setTimeout(() => (open = true), openDelay); }
	function hide(immediate = false) { clearTimeout(timer); if (immediate) open = false; else closeTimer = setTimeout(() => (open = false), closeDelay); }
</script>
<span class="relative inline-flex {className}" aria-describedby={open ? id : undefined} onpointerenter={(event) => show(false)} onpointerleave={() => hide(false)} onpointerdown={() => (open = false)} onfocusin={() => show(true)} onfocusout={() => hide(true)} onkeydown={(event) => event.key === 'Escape' && (open = false)}>
	{@render children()}
	<span aria-hidden={!open} class="pointer-events-none absolute left-1/2 z-50 flex w-0 justify-center {side === 'top' ? 'bottom-[calc(100%+7px)]' : 'top-[calc(100%+7px)]'}">
		<AnimatePresence>
			{#if open}<motion.span role="tooltip" id={id} initial={reducedMotion.current ? false : { opacity: 0, scale: 0.9, y: side === 'top' ? 7 : -7, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.96 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 560, damping: 34, mass: 0.6 }} class="relative w-max max-w-[220px] shrink-0 rounded-[8px] border border-stone-200 bg-white px-2 py-1 text-[11.5px] font-medium leading-snug text-stone-700 shadow-[0_6px_16px_-12px_rgba(28,25,23,0.35)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-100 {contentClass}">{@render label()}</motion.span>{/if}
		</AnimatePresence>
	</span>
</span>
