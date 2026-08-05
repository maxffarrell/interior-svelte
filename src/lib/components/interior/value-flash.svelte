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
	import { fade, fly, scale } from 'svelte/transition';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const ROLL = { type: 'spring', stiffness: 460, damping: 32, mass: 0.55 } as const;
	const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } as const;
	const LIFT = { type: 'spring', stiffness: 380, damping: 26, mass: 0.7 } as const;
	const SETTLE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const CLEAR = { duration: 0.16, ease: [0.4, 0, 1, 1] } as const;
	const DROP = { duration: 0.14, ease: [0.4, 0, 1, 1] } as const;
	const STILL = { duration: 0 } as const;

	let {
		value,
		format = String,
		label,
		hold = 900,
		announceAfter = 700,
		class: className
	}: Props = $props();

	let previous = $state(value);
	let direction = $state<FlashDirection | null>(null);
	let flashing = $state(false);
	let changeId = $state(0);
	let settled = $state(format(value));
	let timer: ReturnType<typeof setTimeout> | undefined;
	let announceTimer: ReturnType<typeof setTimeout> | undefined;
	const text = $derived(format(value));
	const transition = $derived(reducedMotion.current ? STILL : flashing ? LIFT : SETTLE);

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

<span class={cn('relative inline-grid grid-flow-col items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] text-[13px] font-medium tabular-nums transition-colors duration-200', flashing && direction === 'up' ? 'text-moss' : flashing && direction === 'down' ? 'text-flag' : 'text-ink-2', className)}>
	{#if direction}
		<span aria-hidden="true" class={cn('pointer-events-none absolute inset-0 rounded-[6px]', direction === 'up' ? 'bg-moss/12' : 'bg-flag/12')} in:fade={{ duration: reducedMotion.current ? 0 : 160 }} out:fade={{ duration: reducedMotion.current ? 0 : 160 }} />
	{/if}
	<span aria-hidden class="relative inline-grid overflow-hidden">
		{#key changeId}<span in:fly={{ y: direction === 'down' ? -14 : 14, duration: reducedMotion.current ? 0 : 180 }} out:fly={{ y: direction === 'down' ? 10 : -10, duration: reducedMotion.current ? 0 : 140 }} class="col-start-1 row-start-1">{text}</span>{/key}
	</span>
	<span aria-hidden class="relative grid size-[1em] place-items-center">
		<AnimatePresence initial={false}>
			{#if flashing && direction}
				<svg viewBox="0 0 256 256" fill="currentColor" in:scale={{ start: 0.4, duration: reducedMotion.current ? 0 : 180 }} out:fade={{ duration: reducedMotion.current ? 0 : 140 }} class="col-start-1 row-start-1 block size-[0.68em]">
					{#if direction === 'up'}<path d="M128 68 L210 180 H46 Z" />{:else}<path d="M128 188 L46 76 H210 Z" />{/if}
				</svg>
			{/if}
		</AnimatePresence>
	</span>
	<span class="sr-only" aria-live="polite">{label ? `${label}: ${settled}` : settled}</span>
</span>
