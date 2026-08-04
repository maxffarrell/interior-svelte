<script lang="ts">
	import Popover from '#lib/components/interior/popover.svelte';
	const people = ['Ada', 'Grace', 'Alan', 'Barbara']; let open = $state<string | null>(null);
</script>
<div class="grid h-full w-full grid-cols-2 gap-8 p-3">
	{#each people as person (person)}
		{#snippet trigger()}{person}{/snippet}
		{#snippet content()}<div class="w-[196px]"><p class="text-[13px] font-medium">{person} Lovelace</p><p class="mt-2 text-[12.5px] text-stone-500">Two reviews open. Last shipped the docs shell on Tuesday.</p></div>{/snippet}
		<Popover label={`${person}, profile`} open={open === person} onOpenChange={(next) => (open = next ? person : null)} side="top" {trigger} children={content} />
	{/each}
</div>
