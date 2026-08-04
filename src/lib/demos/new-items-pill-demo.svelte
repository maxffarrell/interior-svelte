<script lang="ts">
	import NewItemsPill from '#lib/components/interior/new-items-pill.svelte';
	let count = $state(3);
</script>

<div class="flex justify-center"><NewItemsPill {count} onReveal={() => (count = 0)} /></div>
