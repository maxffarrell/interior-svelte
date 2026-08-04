<script lang="ts">
	import SkeletonSwap from '#lib/components/interior/skeleton-swap.svelte';
	let ready = $state(true);
</script>

<SkeletonSwap {ready} label="Profile"><p>Content appears after the loading surface has been visible long enough to read.</p></SkeletonSwap>
