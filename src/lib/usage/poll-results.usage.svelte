<script lang="ts">
	import PollResults, { type PollOption } from '#lib/components/interior/poll-results.svelte';
	let options = $state<PollOption[]>([{ id: 'one', label: 'First option', votes: 12 }, { id: 'two', label: 'Second option', votes: 8 }]);
</script>

<PollResults label="Which option do you prefer?" {options} onVote={(id) => (options = options.map((option) => option.id === id ? { ...option, votes: option.votes + 1 } : option))} />
