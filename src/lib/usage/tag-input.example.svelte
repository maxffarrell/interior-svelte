<script lang="ts">
	import TagInput from '#lib/components/interior/tag-input.svelte';

	const MAX = 8;
	const SUGGESTIONS = ['motion', 'focus order', 'typography', 'forms', 'dark mode'];

	const readers = new Intl.NumberFormat('en-US');

	let topics = $state(['motion']);

	const spare = $derived(SUGGESTIONS.filter((tag) => !topics.includes(tag)));
	const reach = $derived(topics.length === 0 ? 0 : 1240 + topics.length * 3175);
</script>

<div class="flex w-full justify-center">
	<section class="mat-panel grid w-full max-w-96 gap-3.5 rounded-[14px] p-4">
		<div class="flex items-baseline justify-between gap-3">
			<h3 class="text-[13px] font-medium text-ink">Audience segment</h3>
			<p class="tnum text-[11.5px] text-ink-3">
				{topics.length === 0 ? 'nobody yet' : `${readers.format(reach)} readers`}
			</p>
		</div>

		<TagInput
			label="Topics"
			bind:value={topics}
			max={MAX}
			separators={[',', ';']}
			validate={(candidate) => candidate.length <= 24}
			placeholder="Add a topic"
			hint="Enter adds · Backspace highlights, then removes"
		/>

		<div class="flex flex-wrap items-center gap-1.5">
			{#each spare as tag (tag)}
				<button
					type="button"
					disabled={topics.length >= MAX}
					onclick={() => (topics = [...topics, tag])}
					class="mat-cap press h-6 rounded-md px-2 text-[12.5px] text-ink-3 hover:text-ink-2 disabled:opacity-40"
				>
					+ {tag}
				</button>
			{/each}

			<button
				type="button"
				disabled={topics.length === 0}
				onclick={() => (topics = [])}
				class="ml-auto text-[11.5px] text-ink-3 hover:text-ink-2 disabled:opacity-40"
			>
				Clear all
			</button>
		</div>
	</section>
</div>
