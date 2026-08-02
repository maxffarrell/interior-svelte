<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLInputAttributes, 'value' | 'oninput' | 'onfocus' | 'onblur'> & {
		label: string;
		value?: string;
		defaultValue?: string;
		hint?: string;
		invalid?: boolean;
		ref?: HTMLInputElement | null;
		onChange?: (value: string) => void;
		onFocus?: () => void;
		onBlur?: () => void;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { FloatingLabelState } from './floating-label.state.svelte';

	const LIFT = { type: 'spring', stiffness: 760, damping: 46, mass: 0.5 } as const;
	const INSTANT = { duration: 0 } as const;

	const RAISE = -32;
	const SLIDE = -12;
	const SHRINK = 0.92;

	let {
		label,
		value,
		defaultValue,
		onChange,
		onFocus,
		onBlur,
		hint,
		invalid = false,
		id,
		maxlength,
		required = false,
		disabled = false,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const field = new FloatingLabelState(() => ({
		value,
		defaultValue,
		onChange,
		onFocus,
		onBlur,
		disabled: !!disabled
	}));

	const auto = $props.id();
	const fieldId = $derived(id ?? `${auto}-field`);
	const hintId = `${auto}-hint`;

	const raised = $derived(field.raised);
	const move = $derived(reducedMotion.current || field.instant ? INSTANT : LIFT);
	const tone = $derived(invalid ? 'invalid' : field.focused ? 'focused' : 'rest');
</script>

<div class={cn('w-full', className)}>
	<div class="relative pt-5">
		<div
			data-tone={tone}
			data-disabled={disabled || undefined}
			class={cn(
				'relative h-10 rounded-[10px] border-2 border-hairline transition-[background-color,border-color] duration-150 data-disabled:opacity-55 data-[tone=focused]:border-accent data-[tone=focused]:bg-panel data-[tone=invalid]:border-flag data-[tone=invalid]:bg-panel',

				tone === 'rest' && 'mat-well'
			)}
		>
			<input
				{...rest}
				{...field.inputProps}
				bind:this={ref}
				id={fieldId}
				{maxlength}
				{required}
				aria-required={required || undefined}
				aria-invalid={invalid || undefined}
				aria-describedby={hint ? hintId : undefined}
				class="absolute inset-0 size-full rounded-[9px] bg-transparent px-3 py-0 text-[13px]/5 text-ink-2 outline-none disabled:cursor-not-allowed"
			/>
		</div>

		<motion.label
			for={fieldId}
			data-tone={tone}
			data-raised={raised || undefined}
			initial={false}
			animate={{ y: raised ? RAISE : 0, x: raised ? SLIDE : 0, scale: raised ? SHRINK : 1 }}
			transition={move}
			class="absolute top-8 left-3 block origin-top-left cursor-text text-[13px]/4 text-ink-3 will-change-transform select-none data-raised:text-ink-2 data-[tone=invalid]:text-flag"
		>
			{label}{#if required}<span aria-hidden="true" class="ml-0.5 text-ink-3">*</span>{/if}
		</motion.label>
	</div>

	<div class="mt-1.5 flex h-4 items-start gap-3">
		<p
			aria-hidden="true"
			data-tone={tone}
			class="min-w-0 flex-1 truncate text-[11.5px]/4 text-ink-3 data-[tone=invalid]:text-flag"
		>
			{hint}
		</p>

		{#if maxlength !== undefined && maxlength !== null}
			<span
				aria-hidden="true"
				class="tnum grid shrink-0 justify-items-end font-mono text-[10.5px]/4 text-ink-3"
			>
				<span class="invisible col-start-1 row-start-1">{maxlength} / {maxlength}</span>
				<span class="col-start-1 row-start-1">{field.length} / {maxlength}</span>
			</span>
		{/if}

		{#if hint}
			<span id={hintId} class="sr-only">{hint}</span>
		{/if}
	</div>
</div>
