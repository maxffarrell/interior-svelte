<script lang="ts">
	import PollResults, { type PollOption } from '#lib/components/interior/poll-results.svelte';
	let options = $state<PollOption[]>([{ id: 'oak', label: 'Oak, oiled', votes: 54 }, { id: 'travertine', label: 'Travertine', votes: 41 }, { id: 'brick', label: 'Painted brick', votes: 17 }, { id: 'concrete', label: 'Concrete, sealed', votes: 9 }]);
</script>

<div class="mx-auto w-full max-w-85"><PollResults label="Floor for the front room?" options={options} onVote={(id) => (options = options.map((item) => item.id === id ? { ...item, votes: item.votes + 1 } : item))} /></div>
