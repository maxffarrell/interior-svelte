<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { motion } from 'motion-sv';
	import type { IconMorphMode, IconMorphPreset, MorphShape } from './icon-morph.state.svelte';

	export type IconMorphSemantics = 'label' | 'pressed' | 'expanded';

	export type Props = Omit<ComponentProps<typeof motion.button>, 'children' | 'onerror'> & {
		preset?: IconMorphPreset;
		shapes?: readonly MorphShape[];
		mode?: IconMorphMode;
		labels?: readonly string[];
		active?: number | boolean;
		defaultActive?: number | boolean;
		onActiveChange?: (index: number) => void;
		semantics?: IconMorphSemantics;
		showLabel?: boolean;
		size?: number;
		strokeWidth?: number;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { IconMorphState } from './icon-morph.state.svelte';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		preset = 'menu-close',
		shapes,
		mode,
		labels,
		active = $bindable(),
		defaultActive = 0,
		onActiveChange,
		semantics = 'label',
		showLabel = false,
		size = 20,
		strokeWidth = 1.75,
		disabled = false,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const icon = new IconMorphState(() => ({
		preset,
		shapes,
		mode,
		labels,
		active,
		defaultActive,
		setActive: (next) => (active = next),
		onActiveChange,
		disabled: !!disabled
	}));

	const index = $derived(icon.index);
	const names = $derived(icon.labels);
	const slots = $derived(icon.slots);
	const rotate = $derived(icon.rotate);
	const stroked = $derived(icon.mode === 'stroke');
	const label = $derived(icon.label);

	const transition = $derived(reducedMotion.current ? INSTANT : CELL);
	const labelTransition = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
</script>

<motion.button
	type="button"
	aria-label={label}
	aria-pressed={semantics === 'pressed' ? index === 1 : undefined}
	aria-expanded={semantics === 'expanded' ? index === 1 : undefined}
	{...rest}
	bind:ref
	{disabled}
	data-label={showLabel || undefined}
	onclick={icon.toggle}
	whilePress={disabled || reducedMotion.current ? undefined : { y: 1 }}
	{transition}
	class={cn(
		'mat-cap inline-flex size-9 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-[9px] text-[13px] font-medium text-ink-2 select-none disabled:opacity-50 data-label:w-auto data-label:px-3',
		className
	)}
>
	<motion.span
		aria-hidden="true"
		initial={false}
		animate={{ rotate }}
		{transition}
		class="grid shrink-0 place-items-center"
		style={{ width: size, height: size }}
	>
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			focusable="false"
			fill={stroked ? 'none' : 'currentColor'}
			stroke={stroked ? 'currentColor' : 'none'}
			stroke-width={stroked ? strokeWidth : undefined}
			stroke-linecap="round"
			stroke-linejoin="round"
			class="block"
		>
			{#each slots as slot (slot.key)}
				<motion.path
					initial={false}
					animate={{ d: slot.d, opacity: slot.visible ? 1 : 0 }}
					{transition}
				/>
			{/each}
		</svg>
	</motion.span>

	{#if showLabel}
		<span aria-hidden="true" class="grid">
			{#each names as text, i (i)}
				<motion.span
					initial={false}
					animate={{ opacity: i === index ? 1 : 0, y: i === index ? 0 : i < index ? -3 : 3 }}
					transition={labelTransition}
					class="col-start-1 row-start-1 whitespace-nowrap"
				>
					{text}
				</motion.span>
			{/each}
		</span>
	{/if}
</motion.button>
