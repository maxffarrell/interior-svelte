<script lang="ts" module>
	import type { Attachment } from 'svelte';

	export type CommandItem = { id: string; label: string; hint?: string; keywords?: string; shortcut?: string[] };
	export type CommandPaletteProps = {
		items: CommandItem[];
		onSelect: (item: CommandItem) => void;
		onDismiss?: () => void;
		open?: boolean;
		placeholder?: string;
		emptyLabel?: string;
		label?: string;
		maxRows?: number;
		autoFocus?: boolean;
		class?: string;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const BOUNDARY = /[\s\-_/.:]/;
	function score(text: string, query: string) {
		let cursor = 0; let total = 0; let streak = 0; const value = text.toLowerCase();
		for (let i = 0; i < query.length; i++) { const at = value.indexOf(query[i], cursor); if (at < 0) return -1; streak = at === cursor && i > 0 ? streak + 1 : 0; total += 2 + streak * 4; if (at === 0) total += 12; else if (BOUNDARY.test(value[at - 1])) total += 8; cursor = at + 1; }
		return total;
	}

	let {
		items,
		onSelect,
		onDismiss,
		open: overlayOpen = $bindable(),
		placeholder = 'Search commands',
		emptyLabel = 'No command matches',
		label = 'Command palette',
		maxRows = 6,
		autoFocus = false,
		class: className = ''
	}: CommandPaletteProps = $props();

	let query = $state('');
	let activeId = $state<string | null>(null);
	let input = $state<HTMLInputElement | null>(null);
	let list = $state<HTMLUListElement | null>(null);
	let live = $state<HTMLSpanElement | null>(null);
	const id = $props.id();
	const isOverlay = overlayOpen !== undefined;
	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.map((item, order) => ({ item, score: Math.max(score(item.label, q), item.keywords ? score(item.keywords, q) - 3 : -1) - item.label.length * 0.05, order })).filter((entry) => entry.score >= 0).sort((a, b) => b.score - a.score || a.order - b.order).map((entry) => entry.item);
	});
	const active = $derived(results.some((item) => item.id === activeId) ? activeId : (results[0]?.id ?? null));
	const activeIndex = $derived(results.findIndex((item) => item.id === active));
	const rows = $derived(Math.max(1, Math.min(maxRows, items.length)));
	const height = $derived(5 * 2 + rows * 36 + (rows - 1) * 2);

	function dismiss() { onDismiss?.(); }
	function run(item?: CommandItem) { const target = item ?? results.find((candidate) => candidate.id === active); if (target) onSelect(target); }
	function move(delta: number) { if (results.length) { activeId = results[(activeIndex + delta + results.length) % results.length].id; queueMicrotask(() => list?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })); } }
	function keydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
		else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
		else if (event.key === 'Home') { event.preventDefault(); activeId = results[0]?.id ?? null; }
		else if (event.key === 'End') { event.preventDefault(); activeId = results.at(-1)?.id ?? null; }
		else if (event.key === 'Enter') { event.preventDefault(); run(); }
		else if (event.key === 'Escape') { event.preventDefault(); dismiss(); }
	}

	$effect(() => {
		if (autoFocus && (overlayOpen || !isOverlay)) input?.focus({ preventScroll: true });
		if (!overlayOpen) return;
		const previous = document.body.style.overflow;
		const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
		document.body.style.overflow = 'hidden';
		document.addEventListener('keydown', escape);
		return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); };
	});
	$effect(() => {
		if (overlayOpen !== undefined && overlayOpen) query = '';
	});
	$effect(() => {
		const timer = setTimeout(() => { if (live) live.textContent = results.length ? `${results.length} ${results.length === 1 ? 'command' : 'commands'} available` : emptyLabel; }, 400);
		return () => clearTimeout(timer);
	});

	const portal: Attachment<HTMLDivElement> = (node) => { document.body.appendChild(node); return () => node.remove(); };
</script>

{#snippet surface()}
	<div class="overflow-hidden rounded-[14px] border border-stone-200 bg-white dark:border-white/[0.16] dark:bg-[#1D1D1A] {isOverlay ? 'w-full max-w-[520px] shadow-[0_1px_2px_rgba(28,25,23,0.07),0_28px_56px_-24px_rgba(24,22,20,0.5)]' : ''} {className}">
		<div class="flex h-11 items-center gap-2.5 border-b border-stone-200 px-3 dark:border-white/[0.16]">
			<svg viewBox="0 0 16 16" class="size-[14px] shrink-0 text-stone-500" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.25" /><path d="M10.2 10.2 13.5 13.5" /></svg>
			<input bind:this={input} type="text" role="combobox" aria-label={label} aria-expanded="true" aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={active ? `${id}-${active}` : undefined} autocomplete="off" spellcheck="false" bind:value={query} {placeholder} onkeydown={keydown} class="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200" />
			<span class="min-w-[3ch] shrink-0 text-right font-mono text-[9.5px] tabular-nums text-stone-500">{results.length}</span>
		</div>
		<div class="relative" style:height={`${height}px`}>
			<ul bind:this={list} id={`${id}-list`} role="listbox" aria-label={label} onmousedown={(event) => event.preventDefault()} class="absolute inset-0 flex flex-col gap-[2px] overflow-y-auto overscroll-contain p-[5px] [scrollbar-gutter:stable]">
				{#each results as item (item.id)}
					<motion.li layout id={`${id}-${item.id}`} role="option" aria-selected={item.id === active} onpointermove={() => (activeId = item.id)} onclick={() => run(item)} class="relative flex h-9 shrink-0 cursor-default items-center rounded-[9px] px-2.5">
						<motion.span aria-hidden initial={false} animate={{ opacity: item.id === active ? 1 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }} class="absolute inset-0 rounded-[9px] bg-stone-100 dark:bg-white/10" />
						<span class="relative flex min-w-0 flex-1 items-center gap-2.5"><span class="truncate text-[13px] font-medium text-stone-700 dark:text-stone-200">{item.label}</span>{#if item.hint}<span class="hidden shrink-0 text-[11.5px] text-stone-500 sm:inline">{item.hint}</span>{/if}{#if item.shortcut}<span class="ml-auto flex shrink-0 items-center gap-1">{#each item.shortcut as key}<span class="flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] border border-stone-200 px-1 font-mono text-[9.5px] text-stone-500">{key}</span>{/each}</span>{/if}</span>
					</motion.li>
				{/each}
			</ul>
			{#if !results.length}<motion.p initial={reducedMotion.current ? false : { opacity: 0 }} animate={{ opacity: 1 }} class="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-[12.5px] text-stone-500">{emptyLabel}</motion.p>{/if}
		</div>
		<span bind:this={live} role="status" aria-live="polite" class="sr-only" />
	</div>
{/snippet}

{#if !isOverlay}
	{@render surface()}
{:else}
	<div {@attach portal}>
		<AnimatePresence>
			{#if overlayOpen}
				<motion.div class="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onclick={(event) => event.target === event.currentTarget && dismiss()}>
					<div aria-hidden class="absolute inset-0 bg-stone-900/40 dark:bg-black/65" />
					<motion.div class="relative flex w-full justify-center" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 }}>{@render surface()}</motion.div>
				</motion.div>
			{/if}
		</AnimatePresence>
	</div>
{/if}
