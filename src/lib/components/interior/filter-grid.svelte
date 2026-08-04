<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type FilterDefinition<T> = {
		id: string;
		label: string;
		match: (item: T) => boolean;
	};

	export type Props<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items: readonly T[];
		filters: readonly FilterDefinition<T>[];
		getKey: (item: T) => string;
		label: string;
		children: Snippet<[T]>;
		value?: string;
		defaultValue?: string;
		onValueChange?: (id: string) => void;
		columns?: number;
		rowHeight?: number;
		maxRows?: number;
		gap?: number;
		emptyLabel?: string;
	};
</script>

<script lang="ts" generics="T">
	import { fade, scale } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const MOVE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		items,
		filters,
		getKey,
		label,
		children,
		value,
		defaultValue,
		onValueChange,
		columns = 3,
		rowHeight = 72,
		maxRows = 4,
		gap = 8,
		emptyLabel = 'Nothing matches this filter',
		class: className,
		...rest
	}: Props<T> = $props();

	const fallback = $derived(filters[0]?.id ?? '');
	let internal = $state(defaultValue ?? '');
	const requested = $derived(value ?? internal);
	const current = $derived(filters.find((filter) => filter.id === requested) ?? filters[0]);
	const active = $derived(current?.id ?? fallback);
	const activeIndex = $derived(Math.max(0, filters.findIndex((filter) => filter.id === active)));
	const counts = $derived.by(() => {
		const next: Record<string, number> = {};
		for (const filter of filters) next[filter.id] = items.filter(filter.match).length;
		return next;
	});
	const visible = $derived(filters.find((filter) => filter.id === active)
		? items.filter(filters.find((filter) => filter.id === active)!.match)
		: [...items]);
	const cols = $derived(Math.max(1, Math.floor(columns)));
	const rows = $derived(Math.min(Math.max(1, Math.ceil(items.length / cols)), Math.max(1, maxRows)));
	const box = $derived(rows * rowHeight + (rows - 1) * gap);
	const capped = $derived(Math.ceil(items.length / cols) > Math.max(1, maxRows));
	const motionCell = $derived(reducedMotion.current ? INSTANT : CELL);

	let chips: Array<HTMLButtonElement | null> = [];
	let grid: HTMLUListElement | null = null;
	let heldFocus = false;

	function choose(id: string) {
		heldFocus = !!grid && grid.contains(document.activeElement) && grid !== document.activeElement;
		if (value === undefined) internal = id;
		if (id !== active) onValueChange?.(id);
	}

	function go(index: number) {
		if (!filters.length) return;
		const normalized = (index + filters.length) % filters.length;
		chips[normalized]?.focus();
		choose(filters[normalized].id);
	}

	function keydown(event: KeyboardEvent, index: number) {
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			go(index + 1);
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			go(index - 1);
		} else if (event.key === 'Home') {
			event.preventDefault();
			go(0);
		} else if (event.key === 'End') {
			event.preventDefault();
			go(filters.length - 1);
		}
	}

	$effect(() => {
		if (!heldFocus || !grid) return;
		heldFocus = false;
		if (!grid.contains(document.activeElement)) grid.focus();
	});
</script>

<div {...rest} class={cn('w-full', className)}>
	<div role="radiogroup" aria-label={label} class="flex flex-wrap items-center gap-1.5">
		{#each filters as filter, index (filter.id)}
			{@const on = index === activeIndex}
			<button
				bind:this={chips[index]}
				type="button"
				role="radio"
				aria-checked={on}
				tabindex={on ? 0 : -1}
				onclick={() => choose(filter.id)}
				onkeydown={(event) => keydown(event, index)}
				class="group relative inline-grid h-8 select-none place-items-center rounded-[6px] px-3 outline-none focus-visible:shadow-[0_1px_3px_rgba(28,25,23,0.18)]"
				style="touch-action: manipulation"
			>
				{#if on}<motion.span aria-hidden animate={{ opacity: 1 }} transition={motionCell} class="absolute inset-0 rounded-[6px] bg-ink" />{/if}
				<span aria-hidden class="pointer-events-none absolute inset-0 rounded-[6px] border border-hairline group-focus-visible:border-accent" />
				<span class="relative col-start-1 row-start-1 inline-grid">
					<motion.span aria-hidden animate={{ opacity: on ? 0 : 1 }} transition={motionCell} class="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-ink-2">
						{filter.label}<span class="text-[10.5px] tabular-nums text-ink-3">{counts[filter.id]}</span>
					</motion.span>
					<motion.span aria-hidden animate={{ opacity: on ? 1 : 0 }} transition={motionCell} class="col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-medium text-panel">
						{filter.label}<span class="text-[10.5px] tabular-nums opacity-70">{counts[filter.id]}</span>
					</motion.span>
					<span class="sr-only">{filter.label}, {counts[filter.id]} of {items.length}</span>
				</span>
			</button>
		{/each}
	</div>

	<div class="relative mt-2.5">
		<ul
			bind:this={grid}
			id="filter-grid"
			tabindex="-1"
			class={cn('relative overflow-y-auto overscroll-contain outline-none', capped && '[scrollbar-gutter:stable]')}
			style="display:grid;grid-template-columns:repeat({cols},minmax(0,1fr));grid-auto-rows:{rowHeight}px;gap:{gap}px;height:{box}px"
		>
			{#each visible as item (getKey(item))}
				<li in:scale={{ duration: reducedMotion.current ? 0 : 180, start: 0.97 }} out:fade={{ duration: reducedMotion.current ? 0 : 140 }} animate:flip={{ duration: reducedMotion.current ? 0 : 200 }} class="min-w-0 overflow-hidden rounded-[11px] border border-hairline bg-panel p-2.5 shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)]">
					{@render children(item)}
				</li>
			{/each}
		</ul>
		{#if visible.length === 0}
			<div transition:fade={{ duration: reducedMotion.current ? 0 : 200 }} class="pointer-events-none absolute inset-0 grid place-items-center">
				<span class="text-[12.5px] text-ink-3">{emptyLabel}</span>
			</div>
		{/if}
	</div>
	<p aria-live="polite" class="sr-only">{current?.label ?? ''}: {visible.length} of {items.length} shown</p>
</div>
