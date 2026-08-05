<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type TaskStep = { id: string; label: string; meta?: string };
	export type TaskStepStatus = 'pending' | 'active' | 'done' | 'error';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		steps: TaskStep[];
		current: number;
		failed?: boolean;
		label?: string;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } as const;
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const STILL = { duration: 0 } as const;

	let { steps, current, failed = false, label = 'Task progress', class: className, ...rest }: Props = $props();
	const complete = $derived(!failed && current >= steps.length);
	const rows = $derived(
		steps.map((step, i) => ({
			...step,
			status: (i < current ? 'done' : i === current && failed ? 'error' : i === current && !complete ? 'active' : 'pending') as TaskStepStatus
		}))
	);
	const active = $derived(rows.find((row) => row.status === 'active'));
	const sentence = $derived(
		failed
			? `Failed at ${steps[Math.min(current, steps.length - 1)]?.label ?? 'step'}`
			: complete
				? `All ${steps.length} steps complete`
				: active
					? `${active.label}, step ${current + 1} of ${steps.length}`
					: ''
	);
	let spoken = $state('');

	$effect(() => {
		if (!sentence) return;
		const timer = setTimeout(() => (spoken = sentence), 500);
		return () => clearTimeout(timer);
	});
</script>

<div {...rest} class="w-full {className ?? ''}">
	<ol aria-label={label} class="space-y-0.5">
		{#each rows as row (row.id)}
			<li aria-current={row.status === 'active' ? 'step' : undefined} class="flex h-7 items-center gap-2.5 px-1">
				<span class="relative grid size-4 shrink-0 place-items-center">
					<AnimatePresence initial={false}>
						{#if row.status === 'done'}
							<motion.span class="col-start-1 row-start-1 grid size-4 place-items-center rounded-[5px] bg-emerald-500/[0.14] text-emerald-600 dark:bg-emerald-400/[0.16] dark:text-emerald-400" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: STILL }} transition={reducedMotion.current ? STILL : POP}><svg viewBox="0 0 256 256" width="11" height="11" fill="none" aria-hidden="true"><polyline points="216 72 104 184 48 128" stroke="currentColor" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" /></svg></motion.span>
						{:else if row.status === 'error'}
							<motion.span class="col-start-1 row-start-1 grid size-4 place-items-center rounded-[5px] bg-red-500/[0.12] text-red-600 dark:bg-red-400/[0.14] dark:text-red-400" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: STILL }} transition={reducedMotion.current ? STILL : POP}><svg viewBox="0 0 256 256" width="10" height="10" fill="none" aria-hidden="true"><path d="M200 56 56 200 M56 56l144 144" stroke="currentColor" stroke-width="26" stroke-linecap="round" /></svg></motion.span>
						{:else if row.status === 'active'}
							<motion.span class="col-start-1 row-start-1 text-stone-500 dark:text-stone-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: STILL }} transition={reducedMotion.current ? STILL : CELL}>
								<span aria-hidden="true"><motion.svg viewBox="0 0 16 16" class="size-3" animate={!reducedMotion.current ? { rotate: 360 } : { rotate: 0 }} transition={!reducedMotion.current ? { duration: 0.8, ease: 'linear', repeat: Infinity } : STILL}><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-opacity="0.25" stroke-width="2" /><path d="M8 2 a6 6 0 0 1 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></motion.svg></span>
							</motion.span>
						{:else}
							<motion.span class="col-start-1 row-start-1 size-[5px] rounded-[2px] bg-stone-300 dark:bg-white/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: STILL }} transition={STILL}></motion.span>
						{/if}
					</AnimatePresence>
				</span>
				{#if row.status === 'active' && !reducedMotion.current}
					<motion.span class="min-w-0 flex-1 truncate bg-[linear-gradient(90deg,#78716c_38%,#1c1917_50%,#78716c_62%)] bg-clip-text text-[12.5px] font-medium text-transparent [background-size:220%_100%] dark:bg-[linear-gradient(90deg,#a8a29e_38%,#fafaf9_50%,#a8a29e_62%)]" animate={{ backgroundPosition: ['120% 0', '-120% 0'] }} transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}>{row.label}</motion.span>
				{:else}
					<span class="min-w-0 flex-1 truncate text-[12.5px] transition-colors duration-200 {row.status === 'done' ? 'text-stone-600 dark:text-stone-300' : row.status === 'active' ? 'font-medium text-stone-800 dark:text-stone-100' : row.status === 'error' ? 'font-medium text-red-600 dark:text-red-400' : 'text-stone-400 dark:text-stone-500'}">{row.label}</span>
				{/if}
				{#if row.meta}
					<span class="shrink-0 font-mono text-[10.5px] tabular-nums transition-opacity duration-200 {row.status === 'done' ? 'text-stone-400 opacity-100 dark:text-stone-500' : 'opacity-0'}" aria-hidden={row.status !== 'done'}>{row.meta}</span>
				{/if}
			</li>
		{/each}
	</ol>
	<span role="status" class="sr-only">{spoken}</span>
	<span class="sr-only" aria-live={complete || failed ? 'polite' : 'off'}>{complete ? 'Run complete' : failed ? 'Run failed' : ''}</span>
</div>
