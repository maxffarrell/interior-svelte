<script lang="ts">
	import { motion } from 'motion-sv';
	import ExpandingSearch from '#lib/components/interior/expanding-search.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const GROW = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	const ROW = 36;

	const ITEMS = [
		'Annual report',
		'Brand guidelines',
		'Customer interviews',
		'Design tokens',
		'Engineering handbook'
	];

	let query = $state('');
	let searching = $state(false);

	const hits = $derived(
		ITEMS.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
	);

	const grow = $derived(reducedMotion.current ? INSTANT : GROW);
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel w-full max-w-96 rounded-[14px] p-1.25">
		<div class="relative flex h-10 items-center px-2.5">
			<h3 class="text-[13px] font-medium text-ink">Library</h3>

			<div
				aria-hidden={searching}
				data-searching={searching || undefined}
				class="relative z-10 mr-11 ml-auto flex items-center gap-3 text-[12.5px] text-ink-3 transition-opacity data-searching:pointer-events-none data-searching:opacity-0"
			>
				<button type="button" class="hover:text-ink-2">Sort</button>
				<button type="button" class="hover:text-ink-2">New</button>
			</div>

			<ExpandingSearch
				class="absolute inset-y-0 right-1.25 w-60"
				placeholder="Search library"
				resultCount={hits.length}
				debounce={200}
				onSearch={(value) => (query = value)}
				onOpenChange={(open) => (searching = open)}
			/>
		</div>

		<motion.div
			initial={false}
			animate={{ height: Math.max(hits.length, 1) * ROW }}
			transition={grow}
			class="overflow-hidden"
		>
			<ul>
				{#each hits as name (name)}
					<li class="flex h-9 items-center rounded-[9px] px-2.5 text-[12.5px] text-ink-2">
						{name}
					</li>
				{:else}
					<li class="flex h-9 items-center rounded-[9px] px-2.5 text-[12.5px] text-ink-3">
						Nothing matches “{query}”
					</li>
				{/each}
			</ul>
		</motion.div>
	</div>
</div>
