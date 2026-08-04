<script lang="ts">
	import ReorderList from '#lib/components/interior/reorder-list.svelte';
	type Track = { id: string; title: string; length: string };
	let agenda = $state<Track[]>([{ id: 'a', title: 'Opening remarks', length: '5 min' }, { id: 'b', title: 'Roadmap review', length: '15 min' }, { id: 'c', title: 'Design critique', length: '20 min' }, { id: 'd', title: 'Open questions', length: '10 min' }]);
</script>

<div class="grid w-full place-items-center"><div class="w-full max-w-80"><ReorderList items={agenda} getId={(item) => item.id} getLabel={(item) => item.title} onReorder={(next) => (agenda = next)} label="Meeting agenda">
	{#snippet children(item)}<div class="flex items-baseline justify-between gap-3"><p class="truncate text-[13px] font-medium text-ink-2">{item.title}</p><p class="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-3">{item.length}</p></div>{/snippet}
</ReorderList></div></div>
