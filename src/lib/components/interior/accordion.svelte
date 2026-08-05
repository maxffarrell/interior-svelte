<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Item = { title: string; body: string };
	export type Props = HTMLAttributes<HTMLDivElement> & { items?: Item[] };
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
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
		<div>
			<button
				type="button"
				class="flex w-full items-center gap-3 px-3.5 py-3 text-left text-[13px] font-medium text-ink outline-none transition-colors hover:bg-stone-100 focus-visible:bg-[#4568FF]/[0.06]"
				aria-expanded={open === index}
				onclick={() => (open = open === index ? -1 : index)}
			>
				<span class="min-w-0 flex-1 truncate">{item.title}</span>
				<motion.svg width="13" height="13" viewBox="0 0 256 256" fill="none" initial={false} animate={{ rotate: open === index ? 180 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }}><path d="M208 96l-80 80-80-80" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></motion.svg>
			</button>
			<motion.div initial={false} animate={{ height: open === index ? 'auto' : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 40, mass: 0.6 }} class="overflow-hidden">
				<motion.div initial={false} animate={{ opacity: open === index ? 1 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { duration: open === index ? 0.18 : 0.14 }} class="border-t border-hairline bg-ink/[0.03] px-3.5 pb-3.5 pt-3 text-[12.5px] leading-relaxed text-ink-2">{item.body}</motion.div>
			</motion.div>
		</div>
	{/each}
</div>
