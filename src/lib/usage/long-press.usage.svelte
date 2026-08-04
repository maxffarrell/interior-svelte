<script lang="ts">
	import LongPress from '#lib/components/interior/long-press.svelte';
	let confirmed = $state(false);
</script>

<LongPress onLongPress={() => (confirmed = true)}>{#snippet children()}{confirmed ? 'Confirmed' : 'Hold to confirm'}{/snippet}</LongPress>
