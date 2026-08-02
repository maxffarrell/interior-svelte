<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLButtonAttributes, 'children'> & {
		onConfirm: () => void;
		label: string;
		onAbort?: () => void;
		confirmLabel?: string;
		duration?: number;
		resetAfter?: number;
		steps?: number;
		releaseRate?: number;
		moveTolerance?: number;
		haptic?: boolean;
	};
</script>

<script lang="ts">
	import { animate, motion, useMotionValue, useTransform } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { HoldToConfirmState } from './hold-to-confirm.state.svelte';

	const FACE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const DRAIN = [0.23, 1, 0.32, 1] as const;

	let {
		onConfirm,
		label,
		onAbort,
		confirmLabel = 'Confirmed',
		duration = 1800,
		resetAfter = 1600,
		steps = 20,
		releaseRate = 2.5,
		moveTolerance = 10,
		haptic = true,
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const hold = new HoldToConfirmState(() => ({
		onConfirm,
		onAbort,
		duration,
		steps,
		releaseRate,
		moveTolerance,
		haptic,
		disabled: !!disabled
	}));

	const hintId = $props.id();
	const committed = $derived(hold.committed);
	const seconds = $derived(Math.round(duration / 100) / 10);

	const swept = useMotionValue(0);
	const clipPath = useTransform(swept, (v: number) => `inset(0 ${(1 - v) * 100}% 0 0)`);

	$effect(() => {
		if (reducedMotion.current) {
			swept.set(hold.phase === 'holding' || hold.phase === 'committed' ? 1 : 0);
			return;
		}

		if (hold.phase === 'committed') {
			const controls = animate(swept, 1, { duration: 0.12, ease: 'linear' });
			return () => controls.stop();
		}

		const from = swept.get();

		if (hold.phase === 'holding') {
			const controls = animate(swept, 1, {
				duration: (duration * (1 - from)) / 1000,
				ease: 'linear'
			});
			return () => controls.stop();
		}

		const controls = animate(swept, 0, {
			duration: (duration * from) / releaseRate / 1000,
			ease: [...DRAIN]
		});
		return () => controls.stop();
	});

	$effect(() => {
		if (hold.phase !== 'committed' || resetAfter <= 0) return;
		const back = setTimeout(hold.reset, resetAfter);
		return () => clearTimeout(back);
	});
</script>

{#snippet faces()}
	<span aria-hidden="true" class="col-start-1 row-start-1 grid">
		<motion.span
			initial={false}
			animate={{ opacity: committed ? 0 : 1 }}
			transition={FACE}
			class="col-start-1 row-start-1 flex items-center justify-center whitespace-nowrap"
		>
			{label}
		</motion.span>
		<motion.span
			initial={false}
			animate={{ opacity: committed ? 1 : 0 }}
			transition={FACE}
			class="col-start-1 row-start-1 flex items-center justify-center gap-1.5 whitespace-nowrap"
		>
			<svg
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M2.5 6.4 4.7 8.6 9.5 3.5" />
			</svg>
			{confirmLabel}
		</motion.span>
	</span>
{/snippet}

<button
	type="button"
	aria-label={label}
	aria-describedby={hintId}
	{...rest}
	{...hold.props}
	{disabled}
	aria-disabled={disabled || committed || undefined}
	data-phase={hold.phase}
	data-disabled={disabled || undefined}
	class={cn(
		'relative isolate inline-grid h-10 cursor-pointer touch-manipulation place-items-center overflow-hidden rounded-[9px] border border-hairline bg-panel px-4 text-[13px] font-medium text-ink-2 select-none [-webkit-touch-callout:none] data-disabled:cursor-not-allowed data-disabled:opacity-50',
		className
	)}
>
	{@render faces()}

	<motion.span
		aria-hidden="true"
		style={{ clipPath }}
		class="absolute inset-0 grid place-items-center bg-ink px-4 text-panel"
	>
		{@render faces()}
	</motion.span>

	<span id={hintId} class="sr-only">
		Press and hold for {seconds} seconds to confirm. Releasing early cancels and nothing happens.
	</span>

	<span role="status" aria-live="polite" class="sr-only">
		{committed ? confirmLabel : ''}
	</span>
</button>
