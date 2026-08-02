<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { motion } from 'motion-sv';

	export type Props = Omit<ComponentProps<typeof motion.button>, 'onerror'> & {
		value: string;
		label?: string;
		copiedLabel?: string;
		errorLabel?: string;
		timeout?: number;
		onCopy?: (value: string) => void;
		onError?: (reason: unknown) => void;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { CopyToClipboardState, type CopyStatus } from './copy-button.state.svelte';

	const EASE = [0.23, 1, 0.32, 1] as const;
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const DRAW = { duration: 0.26, ease: EASE } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		value,
		label = 'Copy',
		copiedLabel = 'Copied',
		errorLabel = 'Failed',
		timeout = 2000,
		onCopy,
		onError,
		disabled = false,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const clipboard = new CopyToClipboardState(() => ({ timeout, onCopy, onError }));

	const status = $derived(clipboard.status);
	const fade = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
	const draw = $derived(reducedMotion.current ? INSTANT : DRAW);

	const labels = $derived<Array<[CopyStatus, string]>>([
		['idle', label],
		['copied', copiedLabel],
		['error', errorLabel]
	]);
</script>

<motion.button
	type="button"
	aria-label={label}
	{...rest}
	bind:ref
	{disabled}
	data-status={status}
	onclick={() => clipboard.copy(value)}
	whilePress={disabled || reducedMotion.current ? undefined : { y: 1 }}
	transition={CELL}
	class={cn(
		'mat-cap group inline-flex h-9 touch-manipulation items-center gap-2 rounded-[9px] px-3 text-[13px] font-medium text-ink-2 select-none hover:text-ink disabled:opacity-50',
		className
	)}
>
	<span class="grid size-3.5 shrink-0" aria-hidden="true">
		<motion.svg
			viewBox="0 0 14 14"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="col-start-1 row-start-1 size-3.5"
			initial={false}
			animate={{ opacity: status === 'idle' ? 1 : 0, scale: status === 'idle' ? 1 : 0.92 }}
			transition={fade}
		>
			<path
				d="M9.6 5.1V3.7A1.7 1.7 0 0 0 7.9 2H3.7A1.7 1.7 0 0 0 2 3.7v4.2a1.7 1.7 0 0 0 1.7 1.7h1.4"
			/>
			<rect x="5.1" y="5.1" width="6.9" height="6.9" rx="1.7" />
		</motion.svg>

		<motion.svg
			viewBox="0 0 14 14"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="col-start-1 row-start-1 size-3.5"
			initial={false}
			animate={{ opacity: status === 'copied' ? 1 : 0, scale: status === 'copied' ? 1 : 0.92 }}
			transition={fade}
		>
			<motion.path
				d="M2.9 7.4 5.6 10.1 11.1 4"
				initial={false}
				animate={{ pathLength: status === 'copied' ? 1 : 0 }}
				transition={draw}
			/>
		</motion.svg>

		<motion.svg
			viewBox="0 0 14 14"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="col-start-1 row-start-1 size-3.5"
			initial={false}
			animate={{ opacity: status === 'error' ? 1 : 0, scale: status === 'error' ? 1 : 0.92 }}
			transition={fade}
		>
			<path d="M3.6 3.6 10.4 10.4" />
			<path d="M10.4 3.6 3.6 10.4" />
		</motion.svg>
	</span>

	<span class="relative grid" aria-hidden="true">
		{#each labels as [key, text] (key)}
			<motion.span
				class="col-start-1 row-start-1 whitespace-nowrap"
				initial={false}
				animate={key === status
					? { opacity: 1, y: 0, filter: 'blur(0px)' }
					: { opacity: 0, y: 3, filter: 'blur(3px)' }}
				transition={fade}
			>
				{text}
			</motion.span>
		{/each}
	</span>

	<span role="status" aria-live="polite" class="sr-only">
		{status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : ''}
	</span>
</motion.button>
