<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';
	export type Props = Omit<HTMLButtonAttributes, 'children'> & {
		count?: number;
		onReveal?: () => void;
	};
</script>

<script lang="ts">
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { count = 3, onReveal, class: className, ...rest }: Props = $props();
</script>

<AnimatePresence initial={false}>{#if count > 0}<motion.button
		type="button" onclick={onReveal} aria-label={`${count} new ${count === 1 ? 'item' : 'items'}`}
	initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -5 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 540, damping: 34, mass: 0.5 }}
	class="press mat-cap inline-flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-ink-2 {className ?? ''}"
>
	<span class="size-1.5 rounded-full bg-accent"></span>
	{count} new {count === 1 ? 'item' : 'items'}
	<motion.span aria-hidden="true" class="text-ink-3" initial={false} animate={{ rotate: 0 }}>↓</motion.span>
</motion.button>{/if}</AnimatePresence>
