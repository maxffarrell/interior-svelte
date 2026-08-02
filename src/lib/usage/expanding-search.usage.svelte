<script lang="ts">
	import ExpandingSearch from '#lib/components/interior/expanding-search.svelte';

	let { items }: { items: string[] } = $props();

	let query = $state('');
	let searching = $state(false);

	const hits = $derived(
		items.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<div class="relative flex h-9 items-center px-2">
	<h2 class="text-[13px] font-medium text-ink">Library</h2>

	<div
		aria-hidden={searching}
		data-searching={searching || undefined}
		class="ml-auto flex items-center gap-1.5 transition-opacity data-searching:opacity-0"
	>
		<button type="button">Sort</button>
		<button type="button">New</button>
	</div>

	<div class="absolute inset-y-0 right-2 w-60">
		<ExpandingSearch
			placeholder="Search library"
			resultCount={hits.length}
			debounce={200}
			onSearch={(value) => (query = value)}
			onOpenChange={(open) => (searching = open)}
			onSubmit={(value) => console.log('submit', value)}
		/>
	</div>
</div>
