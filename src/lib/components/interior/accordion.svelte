<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Item = { title: string; body: string };
	export type Props = HTMLAttributes<HTMLDivElement> & { items?: Item[] };
</script>

<script lang="ts">
	let {
		items = [
			{
				title: 'The button jumps',
				body: 'A label changes from Save to Saving and the button resizes, so the row beneath it moves.'
			},
			{
				title: 'The animation cannot be interrupted',
				body: 'Every state has a reachable destination, even when a second gesture arrives halfway through the first.'
			},
			{
				title: 'The interface forgets what happened',
				body: 'Feedback should make the transition legible without making the user wait.'
			}
		],
		class: className,
		...rest
	}: Props = $props();
	let open = $state(0);
</script>

<div
	{...rest}
	class="divide-y divide-hairline rounded-[14px] border border-hairline {className ?? ''}"
>
	{#each items as item, index (item.title)}
		<div class="px-4">
			<button
				type="button"
				class="flex w-full items-center justify-between gap-4 py-4 text-left text-[13px] font-medium text-ink"
				aria-expanded={open === index}
				onclick={() => (open = open === index ? -1 : index)}
			>
				<span>{item.title}</span><span
					class="text-ink-3 transition-transform duration-200"
					class:rotate-45={open === index}>+</span
				>
			</button>
			{#if open === index}<div class="pr-8 pb-4 text-[13px] leading-relaxed text-ink-2">
					{item.body}
				</div>{/if}
		</div>
	{/each}
</div>
