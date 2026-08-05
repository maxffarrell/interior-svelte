<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type LoadMoreStatus = 'idle' | 'loading' | 'error' | 'end';
	export type LoadMoreLabels = Record<LoadMoreStatus, string>;
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		onLoad: () => unknown;
		hasMore?: boolean;
		auto?: boolean;
		root?: Element | null;
		rootMargin?: string;
		maxAutoLoads?: number;
		labels?: Partial<LoadMoreLabels>;
		onError?: (error: unknown) => void;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

		const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
		const INSTANT = { duration: 0 } as const;
		const SPIN = { duration: 0.7, ease: 'linear', repeat: Infinity } as const;
	const DEFAULT_LABELS: LoadMoreLabels = {
		idle: 'Load more',
		loading: 'Loading',
		error: 'Couldn’t load. Try again',
		end: 'You’re all caught up'
	};
	const ORDER: LoadMoreStatus[] = ['idle', 'loading', 'error', 'end'];
	const TONE: Record<LoadMoreStatus, string> = {
		idle: 'text-stone-700 dark:text-stone-200',
		loading: 'text-stone-500 dark:text-stone-400',
		error: 'text-red-600 dark:text-red-400',
		end: 'text-stone-500 dark:text-stone-400'
	};

	let {
		onLoad,
		hasMore = true,
		auto = true,
		root = null,
		rootMargin = '600px 0px',
		maxAutoLoads = 3,
		labels,
		onError,
		class: className,
		...rest
	}: Props = $props();

	let sentinel: HTMLDivElement | null = null;
	let phase = $state<'idle' | 'loading' | 'error'>('idle');
	let ended = $state(false);
	let paused = $state(false);
	let busy = false;
	let blocked = false;
	let runs = 0;
	let sequence = 0;
	let done = false;
	let observer: IntersectionObserver | null = null;
	let alive = true;

	const text = $derived({ ...DEFAULT_LABELS, ...labels });
	const status = $derived<LoadMoreStatus>(ended || !hasMore ? 'end' : phase);
	const inert = $derived(status === 'loading' || status === 'end');

	function reobserve(observer: IntersectionObserver) {
		if (!sentinel) return;
		observer.unobserve(sentinel);
		observer.observe(sentinel);
	}

	function run(manual: boolean) {
		if (busy || done || !hasMore) return;
		if (manual) {
			runs = 0;
			blocked = false;
			paused = false;
		} else {
			if (blocked) return;
			if (runs >= maxAutoLoads) {
				paused = true;
				return;
			}
			runs += 1;
		}

		busy = true;
		const id = ++sequence;
		phase = 'loading';
		Promise.resolve()
			.then(() => onLoad())
			.then(
				(result) => {
					busy = false;
					if (!alive || id !== sequence) return;
					phase = 'idle';
					if (result === false) {
						done = true;
						ended = true;
						return;
					}
					if (observer) reobserve(observer);
				},
				(error: unknown) => {
					busy = false;
					if (!alive || id !== sequence) return;
					blocked = true;
					onError?.(error);
					phase = 'error';
				}
			);
	}

	$effect(() => {
		alive = true;
		return () => (alive = false);
	});

	$effect(() => {
		if (hasMore) {
			done = false;
			ended = false;
		}
	});

	$effect(() => {
		if (!auto || ended || !sentinel || typeof IntersectionObserver === 'undefined') return;
		observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[entries.length - 1];
				if (!entry) return;
				if (entry.isIntersecting) run(false);
				else {
					runs = 0;
					paused = false;
				}
			},
			{ root, rootMargin, threshold: 0 }
		);
		observer.observe(sentinel);
		return () => {
			observer?.disconnect();
			observer = null;
		};
	});

</script>

<div {...rest} class="relative flex w-full justify-center {className ?? ''}">
	<div bind:this={sentinel} aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-px"></div>
	<button
		type="button"
		aria-busy={status === 'loading' || undefined}
		aria-disabled={inert || undefined}
		aria-label={text[status]}
		onclick={(event) => {
			if (inert) {
				event.preventDefault();
				return;
			}
			run(true);
		}}
		class="group relative inline-flex h-8 select-none items-center justify-center rounded-[9px] px-3 text-[12.5px] font-medium outline-none transition-[background-color,box-shadow,transform] duration-150 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] {inert ? 'cursor-default' : 'cursor-pointer hover:bg-stone-800/[0.04] active:translate-y-px dark:hover:bg-white/[0.06]'}"
		style:touch-action="manipulation"
	>
		<motion.span
			aria-hidden="true"
			initial={false}
			animate={{ y: status === 'loading' ? 1 : 0 }}
			transition={reducedMotion.current ? { duration: 0 } : CROSSFADE}
			class="relative grid place-items-center"
		>
			{#each ORDER as item (item)}
				<motion.span
					class="col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap {TONE[item]}"
					initial={false}
					animate={item === status ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 3, filter: 'blur(3px)' }}
					transition={reducedMotion.current ? { duration: 0 } : CROSSFADE}
				>
					{#if item === 'idle'}<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" class="shrink-0"><path d="M2.6 4.2 5.5 7.1 8.4 4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>{/if}
					{#if item === 'loading'}<span aria-hidden="true"><motion.svg width="11" height="11" viewBox="0 0 11 11" fill="none" class="shrink-0" style={{ transformOrigin: '50% 50%' }} initial={false} animate={status === 'loading' && !reducedMotion.current ? { rotate: 360 } : { rotate: 0 }} transition={status === 'loading' && !reducedMotion.current ? SPIN : INSTANT}><circle cx="5.5" cy="5.5" r="3.9" stroke="currentColor" stroke-width="1.5" opacity="0.25" /><path d="M5.5 1.6a3.9 3.9 0 0 1 3.9 3.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" /></motion.svg></span>{/if}
					{#if item === 'error'}<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" class="shrink-0"><path d="M5.5 2.4v3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /><rect x="4.7" y="7.5" width="1.6" height="1.6" rx="0.4" fill="currentColor" /></svg>{/if}
					{#if item === 'end'}<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true" class="shrink-0"><path d="M2.2 5.7 4.5 8 8.8 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>{/if}
					{text[item]}
				</motion.span>
			{/each}
		</motion.span>
	</button>
	<span role="status" aria-live="polite" aria-atomic="true" class="sr-only">{status === 'error' || status === 'end' ? text[status] : ''}</span>
</div>
