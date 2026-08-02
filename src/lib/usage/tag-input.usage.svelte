<script lang="ts">
	import TagInput from '#lib/components/interior/tag-input.svelte';

	let topics = $state(['motion']);
	let saving = $state(false);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		try {
			await fetch('/api/segments', {
				method: 'POST',
				body: JSON.stringify({ topics })
			});
		} finally {
			saving = false;
		}
	}
</script>

<form onsubmit={save} class="w-full max-w-96">
	<TagInput
		label="Topics"
		bind:value={topics}
		max={8}
		separators={[',', ';']}
		validate={(candidate) => candidate.length <= 24}
		hint="Enter adds · Backspace highlights, then removes"
	/>

	<button
		type="submit"
		disabled={topics.length === 0 || saving}
		class="mat-cap mt-3 h-9 rounded-[9px] px-3 text-[13px] font-medium text-ink-2 disabled:opacity-50"
	>
		{saving ? 'Saving…' : 'Save segment'}
	</button>
</form>
