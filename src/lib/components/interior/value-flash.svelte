<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type FlashDirection = 'up' | 'down';
	export type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
		value: number;
		format?: (value: number) => string;
		label?: string;
		hold?: number;
		announceAfter?: number;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const ROLL = { type: 'spring', stiffness: 460, damping: 32, mass: 0.55 } as const;
	const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } as const;
	const LIFT = { type: 'spring', stiffness: 380, damping: 26, mass: 0.7 } as const;
	const SETTLE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		value,
		format = String,
		label,
		hold = 900,
		announceAfter = 700,
		class: className,
		...rest
	}: Props = $props();

	let previous = $state(value);
	let direction = $state<FlashDirection | null>(null);
	let flashing = $state(false);
	let changeId = $state(0);
	let settled = $state(format(value));
	let timer: ReturnType<typeof setTimeout> | undefined;
	let announceTimer: ReturnType<typeof setTimeout> | undefined;
	const text = $derived(format(value));
	const transition = $derived(reducedMotion.current ? INSTANT : flashing ? LIFT : SETTLE);

	$effect(() => {
		if (Object.is(previous, value)) return;
		const prior = previous;
		previous = value;
		const delta = value - prior;
		if (delta === 0) return;
		direction = delta > 0 ? 'up' : 'down';
		flashing = true;
		changeId += 1;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => (flashing = false), hold);
	});

	$effect(() => {
		if (announceTimer) clearTimeout(announceTimer);
		announceTimer = setTimeout(() => (settled = text), announceAfter);
		return () => {
			if (announceTimer) clearTimeout(announceTimer);
		};
	});

	$effect(() => () => {
		if (timer) clearTimeout(timer);
	});
</script>

<motion.span {...rest} initial={false} animate={{ scale: reducedMotion.current ? 1 : flashing ? 1.05 : 1 }} transition={transition} class={cn('relative inline-grid grid-flow-col items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-[13px] font-medium tabular-nums transition-colors duration-200', flashing && direction === 'up' ? 'text-moss' : flashing && direction === 'down' ? 'text-flag' : 'text-ink-2', className)}>
	{#if direction}
		<motion.span aria-hidden animate={{ opacity: flashing ? 1 : 0 }} transition={reducedMotion.current ? INSTANT : CELL} class={cn('pointer-events-none absolute inset-0 rounded-[6px]', direction === 'up' ? 'bg-moss/12' : 'bg-flag/12')} />
	{/if}
	<span aria-hidden class="relative inline-grid overflow-hidden">
		{#key changeId}
			<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={reducedMotion.current ? INSTANT : ROLL} class="col-start-1 row-start-1">{text}</motion.span>
		{/key}
	</span>
	<span aria-hidden class="relative grid size-[1em] place-items-center">
		{#if flashing && direction}
			<motion.svg viewBox="0 0 256 256" fill="currentColor" initial={{ opacity: 0, scale: reducedMotion.current ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={reducedMotion.current ? INSTANT : POP} class="size-[0.68em]">
				{#if direction === 'up'}<path d="M128 68 L210 180 H46 Z" />{:else}<path d="M128 188 L46 76 H210 Z" />{/if}
			</motion.svg>
		{/if}
	</span>
	<span class="sr-only" aria-live="polite">{label ? `${label}: ${settled}` : settled}</span>
</motion.span>
