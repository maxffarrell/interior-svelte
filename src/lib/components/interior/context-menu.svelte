<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type ContextMenuItem =
		| { id: string; type: 'separator' }
		| { id: string; type?: 'item'; label: string; shortcut?: string; icon?: Snippet; disabled?: boolean; onSelect?: (id: string) => void };
	export type ContextMenuProps = {
		items: ContextMenuItem[];
		children: Snippet;
		onSelect?: (id: string) => void;
		label?: string;
		width?: number;
		disabled?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	const EASE = [0.23, 1, 0.32, 1] as const;
	const EXIT = [0.4, 0, 1, 1] as const;

	let { items, children, onSelect, label = 'Context menu', width = 224, disabled = false, class: className = '' }: ContextMenuProps = $props();
	let open = $state(false);
	let active = $state(-1);
	let left = $state(0);
	let top = $state(0);
	let maxHeight = $state(400);
	let placedWidth = $state(width);
	let transformOrigin = $state('0px 0px');
	let trigger = $state<HTMLDivElement | null>(null);
	let menu = $state<HTMLDivElement | null>(null);
	let itemNodes = $state<(HTMLButtonElement | null)[]>([]);
	let holdTimer: ReturnType<typeof setTimeout> | undefined;
	let holdFrom: { x: number; y: number } | null = null;
	let swallowClick = false;
	let pressed = -1;
	let query = '';
	let queryTimer: ReturnType<typeof setTimeout> | undefined;
	const id = $props.id();

	const usable = $derived(items.map((item, index) => item.type !== 'separator' && !item.disabled ? index : -1).filter((index) => index >= 0));
	const hasIcons = $derived(items.some((item) => item.type !== 'separator' && item.icon));
	function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), Math.max(min, max)); }

	function clearHold() { clearTimeout(holdTimer); holdTimer = undefined; holdFrom = null; }
	function openAt(x: number, y: number, keyboard = false) {
		if (disabled || !items.length) return;
		const vw = document.documentElement.clientWidth; const vh = document.documentElement.clientHeight;
		const w = Math.min(width, Math.max(160, vw - 16)); const cap = Math.max(42, vh - 16);
		const h = Math.min(12 + items.reduce((sum, item) => sum + (item.type === 'separator' ? 9 : 32), 0), cap);
		left = Math.max(8, Math.min(vw - w - 8, x + w + 8 <= vw ? x : x - w));
		top = Math.max(8, Math.min(vh - h - 8, y + h + 8 <= vh ? y : y - h));
		placedWidth = w; maxHeight = cap; transformOrigin = `${clamp(x - left, 0, w)}px ${clamp(y - top, 0, h)}px`; pressed = -1; open = true; active = keyboard ? (usable[0] ?? -1) : -1;
	}
	function close(restore = false) { clearHold(); open = false; active = -1; if (restore) trigger?.focus({ preventScroll: true }); }
	function choose(index: number) { const item = items[index]; if (!item || item.type === 'separator' || item.disabled) return; close(true); item.onSelect?.(item.id); onSelect?.(item.id); }
	function move(direction: 1 | -1) { if (!usable.length) return; const at = usable.indexOf(active); active = usable[at < 0 ? direction === 1 ? 0 : usable.length - 1 : (at + direction + usable.length) % usable.length]; }
	function edge(first: boolean) { active = first ? (usable[0] ?? -1) : (usable.at(-1) ?? -1); }
	function typeahead(char: string) {
		query += char.toLowerCase(); clearTimeout(queryTimer); queryTimer = setTimeout(() => (query = ''), 600);
		const start = Math.max(0, usable.indexOf(active) + 1);
		for (let offset = 0; offset < usable.length; offset++) { const index = usable[(start + offset) % usable.length]; const item = items[index]; if (item.type !== 'separator' && item.label.toLowerCase().startsWith(query)) { active = index; return; } }
	}

	function onTriggerKeydown(event: KeyboardEvent) {
		if (open || disabled) return;
		if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10') || (event.key === 'Enter' && event.target === event.currentTarget)) { event.preventDefault(); const rect = (event.currentTarget as HTMLElement).getBoundingClientRect(); openAt(rect.left + 14, rect.top + 14, true); }
	}
	function onMenuKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); }
		else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); edge(event.key === 'Home'); }
		else if (event.key === 'Tab') { event.preventDefault(); close(true); }
		else if (event.key.length === 1 && event.key !== ' ' && !event.metaKey && !event.ctrlKey && !event.altKey) typeahead(event.key);
	}

	$effect(() => {
		if (!open) return;
		const node = active >= 0 ? itemNodes[active] : menu;
		node?.focus({ preventScroll: true });
		if (active >= 0) node?.scrollIntoView({ block: 'nearest' });
		const outside = (event: PointerEvent) => { if (menu?.contains(event.target as Node)) return; if (event.button === 2 && trigger?.contains(event.target as Node)) return; close(); };
		const scroll = (event: Event) => { if (!menu?.contains(event.target as Node)) close(); };
		const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); } };
		const bail = () => close();
		document.addEventListener('pointerdown', outside, true); document.addEventListener('scroll', scroll, true); document.addEventListener('keydown', escape, true); window.addEventListener('resize', bail); window.addEventListener('blur', bail);
		return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('scroll', scroll, true); document.removeEventListener('keydown', escape, true); window.removeEventListener('resize', bail); window.removeEventListener('blur', bail); };
	});
	$effect(() => () => { clearTimeout(holdTimer); clearTimeout(queryTimer); });

	const portal = (node: HTMLDivElement) => { document.body.appendChild(node); return () => node.remove(); };
</script>

<div bind:this={trigger} tabindex={disabled ? -1 : 0} role="button" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined} aria-describedby={`${id}-hint`} style="touch-action: manipulation; -webkit-touch-callout: none" oncontextmenu={(event) => { if (disabled) return; event.preventDefault(); event.stopPropagation(); clearHold(); openAt(event.clientX, event.clientY); }} onkeydown={onTriggerKeydown} onpointerdown={(event) => { if (disabled || event.pointerType === 'mouse' || open) return; holdFrom = { x: event.clientX, y: event.clientY }; holdTimer = setTimeout(() => { holdTimer = undefined; swallowClick = true; navigator.vibrate?.(10); openAt(event.clientX, event.clientY); }, 460); }} onpointermove={(event) => { if (holdTimer && holdFrom && Math.hypot(event.clientX - holdFrom.x, event.clientY - holdFrom.y) > 8) clearHold(); }} onpointerup={clearHold} onpointercancel={clearHold} onpointerleave={clearHold} onclick={(event) => { if (swallowClick) { swallowClick = false; event.preventDefault(); event.stopPropagation(); } }} class="outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.08] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] {className}">
	{@render children()}
	<span id={`${id}-hint`} class="sr-only">Right-click, or press Shift plus F10, for options</span>
</div>

<div {@attach portal}>
	<AnimatePresence>
		{#if open}
			<motion.div bind:this={menu} id={`${id}-menu`} role="menu" aria-label={label} aria-orientation="vertical" tabindex="-1" oncontextmenu={(event) => event.preventDefault()} onkeydown={onMenuKeydown} initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion.current ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: EXIT } }} transition={reducedMotion.current ? { duration: 0 } : { duration: 0.2, ease: EASE }} style={`position: fixed; left: ${left}px; top: ${top}px; width: ${placedWidth}px; max-height: ${maxHeight}px; transform-origin: ${transformOrigin}; z-index: 60;`} class="overflow-y-auto overscroll-contain rounded-[14px] border border-stone-200 bg-white p-[5px] shadow-[0_1px_2px_rgba(28,25,23,0.06),0_16px_36px_-18px_rgba(28,25,23,0.5)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
				{#each items as item, index (item.id)}
					{#if item.type === 'separator'}
						<div class="px-1 py-1"><hr class="h-px border-0 bg-stone-200 dark:bg-white/10" /></div>
					{:else}
						<button bind:this={itemNodes[index]} type="button" role="menuitem" tabindex="-1" aria-disabled={item.disabled || undefined} onpointermove={() => !item.disabled && (active = index)} onpointerdown={() => (pressed = index)} onclick={(event) => { if (event.detail !== 0 && pressed !== index) return; pressed = -1; choose(index); }} class="flex h-8 w-full cursor-default select-none items-center gap-2 rounded-[7px] px-2.5 text-left text-[13px] outline-none {item.disabled ? 'text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-200'} {active === index ? 'bg-stone-100 dark:bg-white/10' : ''}">
							{#if hasIcons}<span aria-hidden class="grid size-4 shrink-0 place-items-center text-stone-500 dark:text-stone-400">{#if item.icon}{@render item.icon()}{/if}</span>{/if}<span class="min-w-0 flex-1 truncate">{item.label}</span>{#if item.shortcut}<span aria-hidden class="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">{item.shortcut}</span>{/if}
						</button>
					{/if}
				{/each}
			</motion.div>
		{/if}
	</AnimatePresence>
</div>
