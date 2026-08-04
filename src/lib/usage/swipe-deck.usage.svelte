<script lang="ts">
	import SwipeDeck from '#lib/components/interior/swipe-deck.svelte';
	const items = [{ id: 'a', label: 'Approve this request' }, { id: 'b', label: 'Review it later' }];
</script>

<SwipeDeck {items} itemKey={(item) => item.id} itemLabel={(item) => item.label} onDecide={(item, choice) => console.log(item.id, choice)}>{#snippet children(item)}<div class="grid h-full place-items-center p-4 text-[13px] text-ink-2">{item.label}</div>{/snippet}</SwipeDeck>
