<script lang="ts">
	import LikeBurst from '#lib/components/interior/like-burst.svelte';

	let like = $state<LikeBurst>();
	let liked = $state(false);

	/* Undoes its own like a moment later, so the burst can be seen twice. */
	$effect(() => {
		if (!liked) return;
		const back = setTimeout(() => {
			like?.toggle();
			liked = false;
		}, 1500);
		return () => clearTimeout(back);
	});
</script>

<div class="flex w-full justify-center">
	<LikeBurst bind:this={like} initialCount={128} onToggle={(next) => (liked = next)} />
</div>
