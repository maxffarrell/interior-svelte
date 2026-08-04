<script lang="ts">
	import ReorderList from '#lib/components/interior/reorder-list.svelte';
	let items = $state([{ id: 'a', label: 'First' }, { id: 'b', label: 'Second' }, { id: 'c', label: 'Third' }]);
</script>

<ReorderList {items} getId={(item) => item.id} getLabel={(item) => item.label} onReorder={(next) => (items = next)} label="Priority order">{#snippet children(item)}<span class="text-[13px] text-ink-2">{item.label}</span>{/snippet}</ReorderList>
