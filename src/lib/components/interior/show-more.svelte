<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLDivElement> & {
		title?: string;
		children?: import('svelte').Snippet;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { title = 'Show more', children, class: className, ...rest }: Props = $props();
	let expanded = $state(false);
</script>

<div {...rest} class="grid gap-3 {className ?? ''}">
	<motion.div class="overflow-hidden" initial={false} animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 190, damping: 30, mass: 1 }}>
		<div class="min-h-0 overflow-hidden text-[13px] leading-relaxed text-ink-2">{@render children?.()}</div>
	</motion.div>
	<button
		type="button"
		class="press mat-cap inline-flex h-8 w-fit items-center gap-2 rounded-[9px] px-3 text-[12px] font-medium text-ink-2"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
		><span class="grid"><motion.span class="col-start-1 row-start-1" initial={false} animate={{ opacity: expanded ? 0 : 1 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }}>{title}</motion.span><motion.span class="col-start-1 row-start-1" initial={false} animate={{ opacity: expanded ? 1 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }}>Show less</motion.span></span><motion.span aria-hidden="true" initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }}>↓</motion.span></button
	>
</div>
