<script lang="ts">
	import LongPress from '#lib/components/interior/long-press.svelte';
	let archived = $state(false);
</script>

<div class="flex justify-center"><LongPress onLongPress={() => (archived = !archived)}>{#snippet children()}<span class="grid text-left"><span class:invisible={archived} class="col-start-1 row-start-1">Hold to archive</span><span class:invisible={!archived} class="col-start-1 row-start-1">Hold to restore</span></span>{/snippet}</LongPress></div>
