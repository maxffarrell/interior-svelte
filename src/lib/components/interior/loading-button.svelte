<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { motion } from 'motion-sv';

	export type Props = Omit<ComponentProps<typeof motion.button>, 'children' | 'onerror'> & {
		onAction: () => unknown;
		label: string;
		pendingLabel?: string;
		successLabel?: string;
		errorLabel?: string;
		resetAfter?: number;
		onError?: (error: unknown) => void;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { AsyncActionState } from './loading-button.state.svelte';

	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;
	const SPIN = { duration: 0.85, repeat: Infinity, ease: 'linear' } as const;

	let {
		onAction,
		label,
		pendingLabel = label,
		successLabel = 'Done',
		errorLabel = 'Try again',
		resetAfter = 1400,
		disabled = false,
		onError,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const action = new AsyncActionState(() => ({ action: onAction, resetAfter, onError }));

	const status = $derived(action.status);
	const pending = $derived(action.pending);
	const fade = $derived(reducedMotion.current ? INSTANT : CROSSFADE);

	const faces = $derived([
		{ key: 'idle' as const, text: label, tone: 'text-ink-2' },
		{ key: 'pending' as const, text: pendingLabel, tone: 'text-ink-3' },
		{ key: 'success' as const, text: successLabel, tone: 'text-moss' },
		{ key: 'error' as const, text: errorLabel, tone: 'text-flag' }
	]);

	const current = $derived(faces.find((f) => f.key === status)?.text ?? label);
</script>

<motion.button
	type="button"
	aria-label={current}
	{...rest}
	bind:ref
	{disabled}
	aria-busy={pending || undefined}
	aria-disabled={pending || undefined}
	data-status={status}
	onclick={action.run}
	whilePress={disabled || pending || reducedMotion.current ? undefined : { y: 1 }}
	transition={CELL}
	class={cn(
		'mat-cap relative inline-flex h-9 touch-manipulation items-center justify-center rounded-[9px] px-3.5 text-[13px] font-medium select-none disabled:opacity-50',
		className
	)}
>
	<span aria-hidden="true" class="relative grid place-items-center">
		{#each faces as face (face.key)}
			<motion.span
				class={cn(
					'col-start-1 row-start-1 flex items-center justify-center gap-1.5 whitespace-nowrap',
					face.tone
				)}
				initial={false}
				animate={face.key === status
					? { opacity: 1, y: 0, filter: 'blur(0px)' }
					: { opacity: 0, y: 3, filter: 'blur(3px)' }}
				transition={fade}
			>
				{#if face.key === 'pending'}
					<motion.svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						class="shrink-0"
						animate={reducedMotion.current || !pending ? undefined : { rotate: 360 }}
						transition={reducedMotion.current || !pending ? undefined : SPIN}
					>
						<circle
							cx="6"
							cy="6"
							r="4.5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-opacity="0.22"
						/>
						<path
							d="M10.5 6A4.5 4.5 0 0 0 6 1.5"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</motion.svg>
				{:else if face.key === 'success'}
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						aria-hidden="true"
						class="shrink-0"
					>
						<path
							d="M2.6 6.3 4.9 8.6 9.4 3.6"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{:else if face.key === 'error'}
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						aria-hidden="true"
						class="shrink-0"
					>
						<path d="M6 2.9v3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
						<path d="M6 9.05h.01" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
					</svg>
				{/if}
				{face.text}
			</motion.span>
		{/each}
	</span>
</motion.button>

<span role="status" aria-live="polite" class="sr-only">
	{status === 'success' ? successLabel : status === 'error' ? errorLabel : ''}
</span>
