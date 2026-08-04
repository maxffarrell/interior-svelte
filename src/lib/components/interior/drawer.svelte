<script lang="ts" module>
	import type { Snippet } from 'svelte';
 export type DrawerSide = 'left' | 'right';
	export type DrawerProps = { open: boolean; onOpenChange: (open: boolean) => void; title: string; children: Snippet; description?: string; footer?: Snippet; side?: DrawerSide; width?: number; container?: 'viewport' | 'parent'; closeLabel?: string; dismissOnScrimClick?: boolean; class?: string };
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let { open, onOpenChange, title, children, description, footer, side = 'right', width = 320, container = 'viewport', closeLabel = 'Close panel', dismissOnScrimClick = true, class: className = '' }: DrawerProps = $props();
	let panel = $state<HTMLDivElement | null>(null);
	let previousFocus = $state<HTMLElement | null>(null);
	let dragging = $state(false);
	let dragX = $state(0);
	let dragStart = 0;
	let originX = 0;
	const sign = side === 'right' ? 1 : -1;
	const id = `drawer-${Math.random().toString(36).slice(2)}`;
	const titleId = `${id}-title`;
	const hintId = `${id}-hint`;
	const portal = (node: HTMLDivElement) => { if (container === 'viewport') document.body.appendChild(node); return () => node.remove(); };
	const edge = $derived(side === 'right' ? 'right-0 rounded-l-[14px] border-l' : 'left-0 rounded-r-[14px] border-r');
	const offset = $derived(dragging ? dragX : 0);

	function close() { onOpenChange(false); }
	function onKeydown(event: KeyboardEvent) {
		if (!panel) return;
		if (event.key === 'Escape') { event.stopPropagation(); close(); return; }
		if (event.key !== 'Tab') return;
		const nodes = Array.from(panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'));
		if (!nodes.length) { event.preventDefault(); panel.focus(); return; }
		const first = nodes[0]; const last = nodes.at(-1);
		if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) { event.preventDefault(); last?.focus(); }
		else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
	}

	function startDrag(event: PointerEvent) {
		if (!open || event.button !== 0) return;
		dragging = true; dragStart = event.clientX; originX = dragX; (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
		const move = (moveEvent: PointerEvent) => { const distance = moveEvent.clientX - dragStart; dragX = Math.max(0, sign * distance + originX); };
		const end = (endEvent: PointerEvent) => { dragging = false; const velocity = Math.abs(endEvent.clientX - dragStart); if (dragX > width * 0.38 || velocity > 520) { dragX = 0; close(); } else dragX = 0; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); };
		window.addEventListener('pointermove', move); window.addEventListener('pointerup', end, { once: true });
	}

	$effect(() => {
		if (!open || !panel) return;
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		(panel.querySelector<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') ?? panel).focus({ preventScroll: true });
		return () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
	});
	$effect(() => {
		if (!open || container !== 'viewport') return;
		const root = document.documentElement; const overflow = root.style.overflow; const padding = root.style.paddingRight; const gutter = window.innerWidth - root.clientWidth; root.style.overflow = 'hidden'; if (gutter > 0) root.style.paddingRight = `${gutter}px`;
		return () => { root.style.overflow = overflow; root.style.paddingRight = padding; };
	});
	$effect(() => {
		if (!open || container !== 'viewport') return;
		const shell = panel?.parentElement; if (!shell) return; const muted: HTMLElement[] = [];
		for (const node of Array.from(document.body.children)) if (node instanceof HTMLElement && !node.contains(shell) && !node.inert) { node.inert = true; muted.push(node); }
		return () => muted.forEach((node) => (node.inert = false));
	});
</script>

<div {@attach portal}>
	<div class="{container === 'viewport' ? 'fixed' : 'absolute'} inset-0 z-50 overflow-hidden {open ? '' : 'pointer-events-none'}">
		<div aria-hidden class="absolute inset-0 bg-stone-900/25 dark:bg-black/55" style:opacity={open ? 1 : 0} transition:opacity={{ duration: reducedMotion.current ? 0 : 200 }} onclick={dismissOnScrimClick ? close : undefined}></div>
		<motion.div bind:this={panel} role="dialog" aria-modal={container === 'viewport'} aria-labelledby={titleId} aria-describedby={hintId} tabindex="-1" onkeydown={onKeydown} style={`transform: translateX(${open ? offset : sign * (width + 24)}px); width: ${width}px; max-width: calc(100% - 40px);`} transition={{ type: 'spring', stiffness: 150, damping: 27, mass: 1 }} class="absolute inset-y-0 flex flex-col border-stone-200 bg-white shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] {edge} {dragging ? 'select-none' : ''} {className}">
			<header onpointerdown={startDrag} class="flex select-none items-start gap-3 border-b border-stone-200 px-4 py-3 dark:border-white/[0.16] {dragging ? 'cursor-grabbing' : 'cursor-grab'}">
				<div class="min-w-0 flex-1"><h2 id={titleId} class="truncate text-[13px] font-medium text-stone-700 dark:text-stone-200">{title}</h2>{#if description}<p class="mt-0.5 truncate text-[12.5px] text-stone-500 dark:text-stone-400">{description}</p>{/if}</div>
				<button type="button" onpointerdown={(event) => event.stopPropagation()} onclick={close} aria-label={closeLabel} class="-mr-1 grid size-7 shrink-0 place-items-center rounded-[7px] text-stone-400 outline-none hover:bg-stone-100 dark:hover:bg-white/10"><svg width="13" height="13" viewBox="0 0 256 256" fill="none" aria-hidden="true"><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-width="16" stroke-linecap="round"/><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg></button>
			</header>
			<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">{@render children()}</div>
			{#if footer}<div class="border-t border-stone-200 px-4 py-3 dark:border-white/[0.16]">{@render footer()}</div>{/if}
			<span id={hintId} class="sr-only">Press Escape to close this panel, or drag its handle toward the edge.</span>
		</motion.div>
	</div>
</div>
