<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLDivElement> & { value?: number | null; label?: string };
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { value = null, label = 'Progress', class: className, ...rest }: Props = $props();
	let percent = $derived(value == null ? null : Math.max(0, Math.min(100, value)));
</script>

<div {...rest} class="grid gap-2 {className ?? ''}">
	<div class="flex items-center justify-between text-[11px] text-ink-3">
		<span>{label}</span><span aria-hidden="true" class="grid justify-items-end text-ink-3">
			<motion.span class="col-start-1 row-start-1 whitespace-nowrap" initial={false} animate={{ opacity: percent == null ? 1 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }}>Working</motion.span>
			<motion.span class="col-start-1 row-start-1 whitespace-nowrap tnum font-mono" initial={false} animate={{ opacity: percent == null ? 0 : 1 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }}>{percent ?? 0}%</motion.span>
		</span>
	</div>
	<div role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percent ?? undefined} class="mat-well relative h-2 overflow-hidden rounded-full">
		{#if percent == null}<motion.div aria-hidden="true" class="absolute inset-y-0 left-0 w-[38%] rounded-full bg-accent" initial={false} animate={reducedMotion.current ? { x: 0 } : { x: ['-120%', '280%'] }} transition={reducedMotion.current ? { duration: 0 } : { duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}></motion.div>{:else}<motion.div aria-hidden="true" class="absolute inset-y-0 left-0 origin-left rounded-full bg-accent" initial={false} animate={{ scaleX: percent / 100 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 210, damping: 34, mass: 0.9 }}></motion.div>{/if}
	</div>
</div>

<style>
	[data-indeterminate='true'] {
		animation: drift 1.4s ease-in-out infinite alternate;
	}
	@keyframes drift {
		from {
			transform: translateX(-18%);
			width: 32%;
		}
		to {
			transform: translateX(180%);
			width: 38%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		[data-indeterminate='true'] {
			animation: none;
		}
	}
</style>
