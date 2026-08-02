<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Validator } from './inline-validation.state.svelte';

	export type Props = Omit<
		HTMLInputAttributes,
		'value' | 'type' | 'oninput' | 'onfocus' | 'onblur'
	> & {
		label: string;
		value: string;
		onChange: (value: string) => void;
		validate: Validator;
		hint?: string;
		type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
		debounce?: number;
		reserveLines?: number;
		ref?: HTMLInputElement | null;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { InlineValidationState } from './inline-validation.state.svelte';

	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	const CLAMP = [
		'line-clamp-1',
		'line-clamp-2',
		'line-clamp-3',
		'line-clamp-4',
		'line-clamp-5',
		'line-clamp-6'
	];

	let {
		label,
		value,
		onChange,
		validate,
		hint,
		type = 'text',
		debounce = 400,
		reserveLines = 1,
		id,
		required = false,
		disabled = false,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const field = new InlineValidationState(() => ({
		value,
		validate,
		debounce,
		disabled: !!disabled
	}));

	const auto = $props.id();
	const fieldId = $derived(id ?? `${auto}-field`);
	const hintId = `${auto}-hint`;
	const errorId = `${auto}-error`;

	const invalid = $derived(field.invalid);
	const valid = $derived(field.valid);
	const tone = $derived(invalid ? 'invalid' : field.focused ? 'focused' : 'rest');
	const fade = $derived(reducedMotion.current ? INSTANT : CROSSFADE);

	const reserved = $derived(
		Array.from({ length: Math.max(1, Math.round(reserveLines)) }, (_, line) => line)
	);
	const clamp = $derived(CLAMP[Math.min(reserved.length, CLAMP.length) - 1]);

	const described = $derived(
		[hint ? hintId : null, invalid ? errorId : null].filter(Boolean).join(' ')
	);
</script>

<div class={cn('w-full', className)}>
	<label for={fieldId} class="block text-[13px] font-medium text-ink-2">
		{label}{#if required}<span aria-hidden="true" class="ml-0.5 text-ink-3">*</span>{/if}
	</label>

	<div
		data-tone={tone}
		data-disabled={disabled || undefined}
		class={cn(
			'relative mt-1.5 h-10 rounded-[10px] border-2 border-hairline transition-[background-color,border-color] duration-150 data-disabled:opacity-55 data-[tone=focused]:border-accent data-[tone=focused]:bg-panel data-[tone=invalid]:border-flag data-[tone=invalid]:bg-panel',

			tone === 'rest' && 'mat-well'
		)}
	>
		<input
			{...rest}
			{...field.fieldProps}
			bind:this={ref}
			id={fieldId}
			{type}
			{value}
			{required}
			aria-required={required || undefined}
			aria-describedby={described || undefined}
			oninput={(event) => onChange(event.currentTarget.value)}
			class="absolute inset-0 size-full rounded-[9px] bg-transparent py-0 pr-9 pl-3 text-[13px]/5 text-ink-2 outline-none disabled:cursor-not-allowed"
		/>

		<span
			aria-hidden="true"
			class="pointer-events-none absolute top-1/2 right-3 grid size-3.5 -translate-y-1/2 place-items-center"
		>
			<motion.svg
				viewBox="0 0 12 12"
				width="14"
				height="14"
				fill="none"
				class="col-start-1 row-start-1 text-moss"
				initial={false}
				animate={{ opacity: valid ? 1 : 0, scale: valid ? 1 : 0.7 }}
				transition={fade}
			>
				<path
					d="M2 6.3 4.7 9 10 3.2"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</motion.svg>

			<motion.svg
				viewBox="0 0 12 12"
				width="14"
				height="14"
				fill="none"
				class="col-start-1 row-start-1 text-flag"
				initial={false}
				animate={{ opacity: invalid ? 1 : 0, scale: invalid ? 1 : 0.7 }}
				transition={fade}
			>
				<path d="M6 2v4.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
				<rect x="5.15" y="8.4" width="1.7" height="1.7" rx="0.5" fill="currentColor" />
			</motion.svg>
		</span>
	</div>

	<div class="relative mt-1.5 grid">
		<span aria-hidden="true" class="invisible col-start-1 row-start-1 text-[11.5px]/4">
			{#each reserved as line (line)}
				<span class="block">&nbsp;</span>
			{/each}
		</span>

		{#if hint}
			<motion.p
				aria-hidden="true"
				class={cn('col-start-1 row-start-1 self-start text-[11.5px]/4 text-ink-3', clamp)}
				initial={false}
				animate={{ opacity: invalid ? 0 : 1, y: invalid ? 3 : 0 }}
				transition={fade}
			>
				{hint}
			</motion.p>
		{/if}

		<motion.p
			aria-hidden="true"
			class={cn('col-start-1 row-start-1 self-start text-[11.5px]/4 text-flag', clamp)}
			initial={false}
			animate={{ opacity: invalid ? 1 : 0, y: invalid ? 0 : -3 }}
			transition={fade}
		>
			{field.error ?? field.message}
		</motion.p>

		{#if hint}
			<span id={hintId} class="sr-only">{hint}</span>
		{/if}

		<span id={errorId} role="status" aria-live="polite" aria-atomic="true" class="sr-only">
			{field.error ?? ''}
		</span>
	</div>
</div>
