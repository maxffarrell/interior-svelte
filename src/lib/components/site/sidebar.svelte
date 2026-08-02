<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLElement>;
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { SvelteSet } from 'svelte/reactivity';
	import { quintOut } from 'svelte/easing';
	import CaretRight from 'phosphor-svelte/lib/CaretRightIcon';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlassIcon';
	import { categories, getCategoryOf, type Category, type Entry } from '#lib/registry';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import Logo from './logo.svelte';

	let { class: className, ...rest }: Props = $props();

	const slug = $derived(page.url.pathname.startsWith('/docs/') ? page.url.pathname.slice(6) : null);
	const activeCat = $derived(slug ? getCategoryOf(slug)?.id : undefined);

	let query = $state('');
	let input = $state<HTMLInputElement>();
	const opened = new SvelteSet<string>();

	// The category you are reading opens itself; everything else stays as you left it.
	$effect(() => {
		const cat = activeCat;
		if (cat) untrack(() => opened.add(cat));
	});

	const needle = $derived(query.trim().toLowerCase());

	const groups = $derived.by(() => {
		if (!needle) return categories;
		return categories
			.map((c) => ({
				...c,
				entries: c.entries.filter((e) => `${e.name} ${e.blurb}`.toLowerCase().includes(needle))
			}))
			.filter((c) => c.entries.length > 0);
	});

	const hits = $derived(groups.reduce((n, c) => n + c.entries.length, 0));
	const allOpen = $derived(opened.size === categories.length);

	function toggle(id: string) {
		if (!opened.delete(id)) opened.add(id);
	}

	function toggleAll() {
		if (allOpen) return opened.clear();
		for (const category of categories) opened.add(category.id);
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== '/' || event.metaKey || event.ctrlKey) return;
		const target = event.target as HTMLElement | null;
		if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
		event.preventDefault();
		input?.focus();
	}

	function stripState(entry: Entry) {
		if (entry.slug === slug) return 'here';
		return entry.status;
	}

	const DURATION = 280;
	const FADE_SHARE = 180 / DURATION;

	function reveal(node: HTMLElement, { closing = false }: { closing?: boolean } = {}) {
		if (reducedMotion.current) return { duration: 0 };
		const height = node.scrollHeight;
		const fade = closing
			? (t: number) => Math.max(0, (t - (1 - FADE_SHARE)) / FADE_SHARE)
			: (t: number) => Math.min(1, t / FADE_SHARE);
		return {
			duration: DURATION,
			easing: quintOut,
			css: (t: number) => `height:${t * height}px;opacity:${fade(t)};overflow:hidden`
		};
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<nav aria-label="Components" {...rest} class={cn('flex h-full flex-col px-2', className)}>
	<div class="shrink-0 pb-2.5">
		<div class="flex h-12 items-center px-2.5">
			<a href="/"><Logo size={15} /></a>
		</div>

		<div class="mat-well flex h-8.5 items-center gap-2 rounded-[9px] px-2.5">
			<MagnifyingGlass
				size={13}
				weight="bold"
				aria-hidden="true"
				class={cn('shrink-0', needle ? 'text-ink-2' : 'text-ink-3')}
			/>
			<input
				bind:this={input}
				bind:value={query}
				onkeydown={(e) => e.key === 'Escape' && (query = '')}
				placeholder="Filter"
				aria-label="Filter components"
				class="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
			/>

			{#if needle}
				<span class="tnum shrink-0 font-mono text-[9.5px] text-ink-3">{hits}</span>
			{:else}
				<kbd
					class="mat-cap grid size-4 shrink-0 place-items-center rounded-sm text-[9.5px] text-ink-3"
				>
					/
				</kbd>
			{/if}
		</div>

		{#if !needle}
			<button
				type="button"
				onclick={toggleAll}
				class="mt-2.5 px-2.5 text-[11.5px] text-ink-3 transition-colors hover:text-ink-2"
			>
				{allOpen ? 'Collapse all' : 'Expand all'}
			</button>
		{/if}
	</div>

	<div class="fade-y no-bar min-h-0 flex-1 overflow-y-auto overscroll-contain pt-1 pb-8">
		{#if groups.length === 0}
			<p class="px-2.5 py-6 text-[12.5px] text-ink-3">Nothing matches “{query.trim()}”.</p>
		{/if}

		{#each groups as category (category.id)}
			{@render section(category)}
		{/each}
	</div>
</nav>

{#snippet section(category: Category)}
	{@const expanded = !!needle || opened.has(category.id)}
	<section>
		<button
			type="button"
			onclick={() => !needle && toggle(category.id)}
			aria-expanded={expanded}
			class="group flex h-8 w-full items-center gap-2 rounded-[9px] px-2.5 hover:bg-well"
		>
			<span
				aria-hidden="true"
				class="flex shrink-0 items-center text-ink-3 transition-transform duration-240 ease-[cubic-bezier(0.23,1,0.32,1)] group-aria-expanded:rotate-90 motion-reduce:transition-none"
			>
				<CaretRight size={10} weight="bold" />
			</span>
			<span
				class="flex-1 truncate text-left text-[13px] text-ink-2 transition-colors duration-150 group-hover:text-ink group-aria-expanded:font-medium group-aria-expanded:text-ink"
			>
				{category.name}
			</span>

			{@render progress(category.entries)}
		</button>

		{#if expanded}
			<div in:reveal out:reveal={{ closing: true }}>
				<ul class="pb-1.5">
					{#each category.entries as entry (entry.slug)}
						<li>{@render row(entry)}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>
{/snippet}

{#snippet progress(entries: Entry[])}
	<span class="flex shrink-0 gap-0.5" aria-hidden="true">
		{#each entries as entry (entry.slug)}
			<span
				data-state={stripState(entry)}
				class="block size-1 rounded-[1px] transition-colors duration-200 data-[state=here]:bg-accent data-[state=planned]:bg-ink/13 data-[state=ready]:bg-ink/42"
			></span>
		{/each}
	</span>
{/snippet}

{#snippet row(entry: Entry)}
	{#if entry.status === 'ready'}
		{@const active = entry.slug === slug}
		<a
			href="/docs/{entry.slug}"
			aria-current={active ? 'page' : undefined}
			data-active={active || undefined}
			class={cn(
				'group flex h-7.5 items-center rounded-lg pr-2.5 pl-7.5',
				active ? 'mat-row' : 'hover:bg-well'
			)}
		>
			<span
				class="truncate text-[13px] text-ink-2 group-hover:text-ink group-data-active:font-medium group-data-active:text-ink"
			>
				{entry.name}
			</span>
		</a>
	{:else}
		<span class="flex h-7.5 items-center pr-2.5 pl-7.5 text-[13px] text-ink-3/70 select-none">
			<span class="truncate">{entry.name}</span>
		</span>
	{/if}
{/snippet}
