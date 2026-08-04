<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type StreamingTextStatus = 'idle' | 'streaming' | 'paused' | 'done';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		text: string;
		tokensPerSecond?: number;
		autoStart?: boolean;
		showSkip?: boolean;
		label?: string;
		onDone?: () => void;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const CHARS_PER_TOKEN = 4;
	const MAX_FRAME_DELTA = 64;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;

	let {
		text,
		tokensPerSecond = 18,
		autoStart = true,
		showSkip = true,
		label = 'Streamed response',
		onDone,
		class: className,
		...rest
	}: Props = $props();

	let index = $state(0);
	let status = $state<StreamingTextStatus>(autoStart ? 'streaming' : 'idle');
	let cursor = 0;
	let lastText = text;
	let lastAutoStart = autoStart;

	function finish() {
		if (status !== 'done') {
			status = 'done';
			onDone?.();
		}
	}

	function start() {
		if (status !== 'done') status = 'streaming';
	}

	function pause() {
		if (status === 'streaming') status = 'paused';
	}

	function skip() {
		cursor = text.length;
		index = text.length;
		finish();
	}

	function reset() {
		cursor = 0;
		index = 0;
		status = autoStart ? 'streaming' : 'idle';
	}

	$effect(() => {
		if (text !== lastText || autoStart !== lastAutoStart) {
			lastText = text;
			lastAutoStart = autoStart;
			cursor = 0;
			index = 0;
			status = autoStart ? 'streaming' : 'idle';
		}
	});

	$effect(() => {
		if (status !== 'streaming') return;
		if (reducedMotion.current || cursor >= text.length) {
			cursor = text.length;
			index = text.length;
			finish();
			return;
		}

		const interval = 1000 / Math.max(1, tokensPerSecond * CHARS_PER_TOKEN);
		let frame = 0;
		let last = performance.now();
		let carry = 0;
		const tick = (now: number) => {
			carry += Math.min(now - last, MAX_FRAME_DELTA);
			last = now;
			if (carry >= interval) {
				const advance = Math.floor(carry / interval);
				carry -= advance * interval;
				cursor = Math.min(text.length, cursor + advance);
				index = cursor;
				if (cursor >= text.length) {
					finish();
					return;
				}
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!reducedMotion.current) return;
		cursor = text.length;
		index = text.length;
		finish();
	});

	const visible = $derived(text.slice(0, index));
	const done = $derived(status === 'done');
	const blink = $derived(!reducedMotion.current && (status === 'idle' || status === 'paused'));
</script>

<div {...rest} role="group" aria-label={label} aria-busy={status === 'streaming'} class="text-[13.5px] leading-relaxed text-stone-700 dark:text-stone-200 {className ?? ''}">
	<p aria-hidden="true" class="relative whitespace-pre-line">
		<span class="invisible">{text}</span>
		<span class="absolute inset-0 whitespace-pre-line">
			{visible}<span aria-hidden="true" class="relative inline-block h-[1.1em] w-0 align-[-0.22em]"><motion.span
				class="absolute inset-y-0 left-px block w-[2px] bg-stone-800 dark:bg-stone-100"
				initial={false}
				animate={blink ? { opacity: [1, 1, 0, 0] } : { opacity: done ? 0 : 1 }}
				transition={blink ? { duration: 1.06, times: [0, 0.45, 0.5, 0.95], repeat: Infinity, ease: 'linear' } : reducedMotion.current ? { duration: 0 } : CROSSFADE}
			/></span>
		</span>
	</p>
	<span role="status" aria-live="polite" class="sr-only">{done ? text : ''}</span>
	{#if showSkip}
		<div class="mt-2.5 flex justify-end">
			<button
				type="button"
				onclick={done ? () => { reset(); start(); } : skip}
				aria-label={done ? `Replay ${label}` : 'Skip to the end'}
				class="inline-grid h-7 place-items-center rounded-[6px] border border-stone-200 px-2.5 text-[11.5px] font-medium text-stone-500 transition-colors duration-150 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-white/[0.16] dark:text-stone-400 dark:hover:text-stone-200 dark:focus-visible:ring-stone-500"
			>
				<span class="col-start-1 row-start-1 transition-[opacity,transform,filter] duration-200" style:opacity={done ? 0 : 1} style:transform={done ? 'translateY(3px)' : 'translateY(0)'}>Skip</span>
				<span class="col-start-1 row-start-1 transition-[opacity,transform,filter] duration-200" style:opacity={done ? 1 : 0} style:transform={done ? 'translateY(0)' : 'translateY(3px)'}>Replay</span>
			</button>
		</div>
	{/if}
</div>
