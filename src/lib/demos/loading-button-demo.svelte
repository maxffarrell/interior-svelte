<script lang="ts">
	import LoadingButton from '#lib/components/interior/loading-button.svelte';

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
</script>

<div class="flex w-full flex-wrap items-center justify-center">
	<LoadingButton
		label="Publish"
		pendingLabel="Publish"
		successLabel="Published"
		onAction={() => wait(1100)}
	/>
</div>
