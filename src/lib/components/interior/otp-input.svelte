<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { OtpMode } from './otp-input.state.svelte';

	export type OtpStatus = 'idle' | 'error' | 'success';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'autofocus'> & {
		length?: number;
		mode?: OtpMode;
		defaultValue?: string;
		onChange?: (value: string) => void;
		onComplete?: (value: string) => void;
		status?: OtpStatus;
		hint?: string;
		errorMessage?: string;
		successMessage?: string;
		label?: string;
		groupEvery?: number;
		disabled?: boolean;
		autofocus?: boolean;
		focusOnError?: boolean;
	};
</script>

<script lang="ts">
	import { animate, motion, useMotionValue } from 'motion-sv';
	import { cubicOut } from 'svelte/easing';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { OtpInputState } from './otp-input.state.svelte';

	type Glyph = { y: number; blur: number; from: number };

	const glyph = (node: Element, { y, blur, from }: Glyph) => ({
		duration: reducedMotion.current ? 0 : 220,
		easing: cubicOut,
		css: (t: number, u: number) =>
			`opacity: ${t}; transform: translateY(${u * y}px) scale(${from + (1 - from) * t}); filter: blur(${u * blur}px)`
	});

	const ARRIVE = { y: 10, blur: 6, from: 0.97 } as const;
	const LEAVE = { y: -6, blur: 3, from: 0.98 } as const;

	const EASE = [0.23, 1, 0.32, 1] as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const BLINK = {
		duration: 1.06,
		times: [0, 0.5, 0.5, 1],
		repeat: Infinity,
		ease: 'linear'
	} as const;
	const INSTANT = { duration: 0 } as const;

	const SHAKE = [0, -5, 4, -3, 0];
	const SHAKE_DURATION = 0.32;

	let {
		length = 6,
		mode = 'numeric',
		defaultValue = '',
		onChange,
		onComplete,
		status = 'idle',
		hint = '',
		errorMessage = '',
		successMessage = '',
		label = 'Verification code',
		groupEvery = 3,
		disabled = false,
		autofocus = false,
		focusOnError = true,
		class: className,
		...rest
	}: Props = $props();

	const otp = new OtpInputState(() => ({
		length,
		mode,
		defaultValue,
		disabled: !!disabled,
		onChange,
		onComplete
	}));

	export const clear = otp.clear;
	export const focus = otp.focus;

	const statusId = $props.id();

	const error = $derived(status === 'error');
	const success = $derived(status === 'success');

	const hasStatus = $derived(
		hint.length > 0 || errorMessage.length > 0 || successMessage.length > 0
	);
	const message = $derived(error ? errorMessage : success ? successMessage : hint);

	const swap = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
	const blink = $derived(reducedMotion.current ? INSTANT : BLINK);

	const shake = useMotionValue(0);

	let wasError = false;

	$effect(() => {
		if (status !== 'error' || reducedMotion.current) {
			shake.set(0);
			return;
		}

		const controls = animate(shake, SHAKE, { duration: SHAKE_DURATION, ease: [...EASE] });
		return () => controls.stop();
	});

	$effect(() => {
		if (error && !wasError && focusOnError && !disabled) otp.focusAt(0);
		wasError = error;
	});

	$effect(() => {
		if (autofocus && !disabled) otp.focusAt(0);
	});
</script>

<div {...rest} class={cn('inline-flex flex-col', className)}>
	<motion.div role="group" aria-label={label} style={{ x: shake }} class="relative flex gap-2">
		{#each otp.chars as char, index (index)}
			{@const active = otp.focusedIndex === index}
			{@const tone = error
				? 'error'
				: success
					? 'success'
					: active
						? 'active'
						: char
							? 'filled'
							: 'rest'}

			<div
				data-grouped={groupEvery > 0 && index > 0 && index % groupEvery === 0 ? '' : undefined}
				class="relative h-12 w-10 data-grouped:ml-3"
			>
				<input
					{...otp.cellProps(index)}
					aria-label="{label}, character {index + 1} of {length}"
					aria-invalid={error || undefined}
					aria-describedby={hasStatus ? statusId : undefined}
					data-tone={tone}
					class={cn(
						'size-full rounded-[10px] border-2 border-hairline text-center text-[15px] text-transparent caret-transparent transition-[background-color,border-color] duration-150 outline-none selection:bg-transparent focus-visible:outline-none disabled:opacity-50 data-[tone=active]:border-accent data-[tone=active]:bg-panel data-[tone=error]:border-flag data-[tone=error]:bg-panel data-[tone=filled]:border-hairline-strong data-[tone=filled]:bg-panel data-[tone=success]:border-moss data-[tone=success]:bg-panel',
						tone === 'rest' && 'mat-well'
					)}
				/>

				<span
					aria-hidden="true"
					class="pointer-events-none absolute inset-0 grid place-items-center"
				>
					{#if char}
						{#key char}
							<span
								in:glyph={ARRIVE}
								out:glyph={LEAVE}
								class="tnum col-start-1 row-start-1 font-mono text-[15px] text-ink-2"
							>
								{char}
							</span>
						{/key}
					{/if}

					{#if active && !char && !disabled}
						<motion.span
							initial={{ opacity: 1 }}
							animate={reducedMotion.current ? { opacity: 1 } : { opacity: [1, 1, 0, 0] }}
							transition={blink}
							class="col-start-1 row-start-1 block h-4.25 w-[1.5px] rounded-[1px] bg-ink-2"
						/>
					{/if}
				</span>
			</div>
		{/each}
	</motion.div>

	{#if hasStatus}
		<div aria-hidden="true" class="mt-2 grid h-4 text-[11.5px]/4">
			<motion.span
				initial={false}
				animate={{ opacity: status === 'idle' ? 1 : 0 }}
				transition={swap}
				class="col-start-1 row-start-1 truncate text-ink-3"
			>
				{hint}
			</motion.span>

			<motion.span
				initial={false}
				animate={{ opacity: error ? 1 : 0 }}
				transition={swap}
				class="col-start-1 row-start-1 truncate text-flag"
			>
				{errorMessage}
			</motion.span>

			<motion.span
				initial={false}
				animate={{ opacity: success ? 1 : 0 }}
				transition={swap}
				class="col-start-1 row-start-1 truncate text-moss"
			>
				{successMessage}
			</motion.span>
		</div>

		<span id={statusId} role="status" class="sr-only">{message}</span>
	{/if}
</div>
