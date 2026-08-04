<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		target?: HTMLElement | null;
		scroller?: HTMLElement | null;
		steps?: number;
		words?: number;
		wordsPerMinute?: number;
		label?: string;
		doneLabel?: string;
	};

	export type ReadingProgressState = {
		step: number;
		steps: number;
		progress: number;
		percent: number;
		minutesLeft: number;
		totalMinutes: number;
		complete: boolean;
	};

	function clamp01(value: number) {
		if (!Number.isFinite(value) || value < 0) return 0;
		return Math.min(1, value);
	}
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		target = null,
		scroller = null,
		steps = 24,
		words = 0,
		wordsPerMinute = 220,
		label = 'Reading progress',
		doneLabel = 'End',
		class: className,
		...rest
	}: Props = $props();

	let step = $state(0);
	let currentStep = 0;
	let frame = 0;
	const progress = $derived(steps > 0 ? step / steps : 1);
	const percent = $derived(Math.round(progress * 100));
	const totalMinutes = $derived(words > 0 ? Math.max(1, Math.ceil(words / wordsPerMinute)) : 0);
	const minutesLeft = $derived(words > 0 ? Math.ceil(((1 - progress) * words) / wordsPerMinute) : 0);
	const complete = $derived(step >= steps);
	const estimate = $derived(words > 0);
	const transition = $derived(reducedMotion.current ? 'none' : 'transform 210ms cubic-bezier(0.23, 1, 0.32, 1)');

	$effect(() => {
		const scrollEl = scroller;
		const targetEl = target;
		const source: EventTarget = scrollEl ?? window;
		const read = () => {
			frame = 0;
			const viewport = scrollEl ? scrollEl.clientHeight : window.innerHeight;
			let ratio: number;
			if (targetEl) {
				const rect = targetEl.getBoundingClientRect();
				const base = scrollEl ? scrollEl.getBoundingClientRect().top : 0;
				const travel = rect.height - viewport;
				ratio = travel <= 0 ? 1 : (base - rect.top) / travel;
			} else if (scrollEl) {
				const travel = scrollEl.scrollHeight - scrollEl.clientHeight;
				ratio = travel <= 0 ? 1 : scrollEl.scrollTop / travel;
			} else {
				const travel = document.documentElement.scrollHeight - viewport;
				ratio = travel <= 0 ? 1 : window.scrollY / travel;
			}
			const next = Math.round(clamp01(ratio) * steps);
			if (next !== currentStep) {
				currentStep = next;
				step = next;
			}
		};
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(read);
		};
		source.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
		if (observer) {
			if (targetEl) observer.observe(targetEl);
			if (scrollEl) observer.observe(scrollEl);
			if (!targetEl && !scrollEl) observer.observe(document.documentElement);
		}
		read();
		return () => {
			source.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			observer?.disconnect();
			if (frame) cancelAnimationFrame(frame);
			frame = 0;
		};
	});
</script>

<div class="flex items-center gap-3 {className ?? ''}" {...rest}>
	<div
		role="progressbar"
		aria-label={label}
		aria-valuemin="0"
		aria-valuemax={steps}
		aria-valuenow={step}
		aria-valuetext={estimate ? `${percent}% read, ${minutesLeft} min left` : `${percent}% read`}
		class="min-w-0 flex-1 rounded-[4px] bg-stone-100 p-[2px] shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]"
	>
		<div class="h-[3px] origin-left rounded-[2px] bg-[#4568FF] dark:bg-[#93B0FF]" style:transform={`scaleX(${progress})`} style:transition={transition}></div>
	</div>
	{#if estimate}
		<div class="grid shrink-0 justify-items-end font-mono text-[10.5px] tabular-nums">
			<span aria-hidden="true" class="invisible col-start-1 row-start-1 whitespace-nowrap">{doneLabel} · {totalMinutes} min</span>
			<span aria-hidden="true" class="col-start-1 row-start-1 whitespace-nowrap text-stone-500 transition-opacity duration-250 dark:text-stone-400" style:opacity={complete ? '0' : '1'}>{minutesLeft} min left</span>
			<span aria-hidden="true" class="col-start-1 row-start-1 flex items-center gap-1 whitespace-nowrap text-stone-700 transition-opacity duration-250 dark:text-stone-200" style:opacity={complete ? '1' : '0'}>
				<svg width="12" height="12" viewBox="0 0 256 256" fill="none" aria-hidden="true"><polyline points="216 72 104 184 48 128" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg>
				{doneLabel} · {totalMinutes} min
			</span>
		</div>
	{/if}
</div>
