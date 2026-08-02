<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PasswordRule } from './password-strength.state.svelte';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		value: string;
		rules?: readonly PasswordRule[];
		labels?: readonly string[];
		announceDelay?: number;
		showRules?: boolean;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import {
		defaultPasswordLabels,
		defaultPasswordRules,
		PasswordStrengthState
	} from './password-strength.state.svelte';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		value,
		rules = defaultPasswordRules,
		labels = defaultPasswordLabels,
		announceDelay = 700,
		showRules = true,
		class: className,
		...rest
	}: Props = $props();

	const strength = new PasswordStrengthState(() => ({ value, rules, labels, announceDelay }));

	const score = $derived(strength.score);
	const tone = $derived(strength.tone);
	const active = $derived(Math.min(score, labels.length - 1));
	const spoken = $derived(labels[active] ?? '');
	const fade = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
	const pop = $derived(reducedMotion.current ? INSTANT : CELL);
</script>

<div {...rest} {...strength.rootProps} class={cn('w-full', className)}>
	<div
		role="meter"
		aria-label="Password strength"
		aria-valuemin={0}
		aria-valuemax={strength.max}
		aria-valuenow={score}
		aria-valuetext={spoken}
		class="flex gap-1.5"
	>
		{#each rules as rule, i (rule.id)}
			<div class="mat-well relative h-1.5 flex-1 overflow-hidden rounded-xs">
				<motion.span
					data-tone={tone}
					initial={false}
					animate={{ scaleX: i < score ? 1 : 0 }}
					transition={reducedMotion.current
						? INSTANT
						: { ...CELL, delay: i < score ? i * 0.03 : 0 }}
					class="absolute inset-0 origin-left rounded-xs transition-colors duration-200 data-[tone=caution]:bg-amber-500 data-[tone=danger]:bg-flag data-[tone=safe]:bg-moss"
				/>
			</div>
		{/each}
	</div>

	<div class="mt-2 flex h-5 items-center justify-between gap-3">
		<span class="inline-grid text-[12.5px]/5 font-medium">
			{#each labels as text, i (i)}
				<motion.span
					aria-hidden="true"
					data-tone={tone}
					initial={false}
					animate={{ opacity: i === active ? 1 : 0 }}
					transition={fade}
					class="col-start-1 row-start-1 whitespace-nowrap text-ink-3 transition-colors duration-200 data-[tone=caution]:text-amber-600 data-[tone=danger]:text-flag data-[tone=safe]:text-moss dark:data-[tone=caution]:text-amber-400"
				>
					{text}
				</motion.span>
			{/each}
		</span>

		<motion.span
			aria-hidden="true"
			initial={false}
			animate={{ opacity: strength.guessable ? 1 : 0 }}
			transition={fade}
			class="text-[11.5px]/5 whitespace-nowrap text-amber-600 dark:text-amber-400"
		>
			Commonly guessed
		</motion.span>
	</div>

	{#if showRules}
		<ul class="mt-3 grid gap-1.5">
			{#each strength.rules as rule (rule.id)}
				<li class="flex items-center gap-2">
					<span
						aria-hidden="true"
						class="relative grid size-3.5 shrink-0 place-items-center rounded-sm border border-hairline text-panel"
					>
						<motion.span
							initial={false}
							animate={{ opacity: rule.met ? 1 : 0 }}
							transition={fade}
							class="absolute inset-0 rounded-[3px] bg-moss"
						/>
						<motion.svg
							viewBox="0 0 12 12"
							fill="none"
							class="relative size-2.25"
							initial={false}
							animate={{ opacity: rule.met ? 1 : 0, scale: rule.met ? 1 : 0.6 }}
							transition={pop}
						>
							<path
								d="M2 6.2 4.7 8.9 10 3.3"
								stroke="currentColor"
								stroke-width="1.9"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</motion.svg>
					</span>

					<span
						data-met={rule.met || undefined}
						class="text-[12.5px]/5 text-ink-3 transition-colors duration-200 data-met:text-ink-2"
					>
						{rule.label}
					</span>

					<span class="sr-only">{rule.met ? 'met' : 'not met'}</span>
				</li>
			{/each}
		</ul>
	{/if}

	<p aria-live="polite" class="sr-only">{strength.announcement}</p>
</div>
