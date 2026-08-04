<script lang="ts">
	import SkeletonSwap from '#lib/components/interior/skeleton-swap.svelte';
	const BIO = 'Ships the last twenty percent. Writes about the half-second after a click, and about the three things that always go missing before a component is actually done.';
	let ready = $state(false);
	$effect(() => {
		const timer = setTimeout(() => (ready = true), 900);
		return () => clearTimeout(timer);
	});
</script>

<div class="flex justify-center"><SkeletonSwap {ready} lines={3} lineHeight={21} label="Profile" class="w-full max-w-[400px]"><p class="text-[13.5px] leading-[21px] text-ink-2">{BIO}</p></SkeletonSwap></div>
