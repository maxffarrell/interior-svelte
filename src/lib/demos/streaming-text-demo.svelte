<script lang="ts">
	import StreamingText from '#lib/components/interior/streaming-text.svelte';
	const ANSWER = 'The invoice failed because the card on file expired on the third, so the retry schedule kept charging a dead account.\n\nI paused it. Update the card and the charge re-runs tonight.';
</script>

<div class="mx-auto w-full max-w-[440px]"><StreamingText text={ANSWER} tokensPerSecond={9} /></div>
