<script lang="ts">
	import FilterGrid, { type FilterDefinition } from '#lib/components/interior/filter-grid.svelte';
	type Item = { id: string; label: string; kind: 'todo' | 'done' };
	const items: Item[] = [{ id: '1', label: 'Ship the port', kind: 'todo' }, { id: '2', label: 'Review keyboard paths', kind: 'done' }, { id: '3', label: 'Publish notes', kind: 'todo' }];
	const filters: FilterDefinition<Item>[] = [{ id: 'all', label: 'All', match: () => true }, { id: 'todo', label: 'Open', match: (item) => item.kind === 'todo' }, { id: 'done', label: 'Done', match: (item) => item.kind === 'done' }];
</script>

<FilterGrid {items} {filters} getKey={(item) => item.id} label="Task status">{#snippet children(item)}<span class="text-[13px] text-ink-2">{item.label}</span>{/snippet}</FilterGrid>
