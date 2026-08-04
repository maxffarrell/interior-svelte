<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		bar: Snippet;
		children: Snippet;
		barHeight?: number;
		hideAfter?: number;
		revealAfter?: number;
		topGuard?: number;
		pinned?: boolean;
		maxHeight?: number;
		label?: string;
		onHiddenChange?: (hidden: boolean) => void;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		bar,
		children,
		barHeight = 44,
		hideAfter = 14,
		revealAfter = 10,
		topGuard = 24,
		pinned = false,
		maxHeight = 320,
		label = 'Scrollable content',
		onHiddenChange,
		class: className,
		...rest
	}: Props = $props();

	let scroller = $state<HTMLDivElement | null>(null);
	let hidden = $state(false);
	let atTop = $state(true);
	let focusWithin = $state(false);
	let frame = 0;
	let last = 0;
	let accum = 0;
	const held = $derived(pinned || focusWithin);
	const down = $derived(Math.max(1, hideAfter));
	const up = $derived(Math.max(1, revealAfter));
	const guard = $derived(Math.max(0, topGuard));
	const slideTransition = $derived(reducedMotion.current ? 'none' : 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)');
	const fadeTransition = $derived(reducedMotion.current ? 'none' : 'opacity 260ms cubic-bezier(0.23, 1, 0.32, 1)');

	$effect(() => {
		const el = scroller;
		const target: EventTarget = el ?? window;
		const readY = () => (el ? el.scrollTop : window.scrollY);
		const readMax = () => el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
		const evaluate = () => {
			frame = 0;
			const max = readMax();
			const y = readY();
			if (max <= guard) {
				accum = 0;
				last = y;
				atTop = true;
				hidden = false;
				return;
			}
			if (y < 0 || y > max) return;
			const dy = y - last;
			last = y;
			atTop = y <= guard;
			if (held || atTop) {
				accum = 0;
				hidden = false;
				return;
			}
			if (!dy) return;
			if ((dy > 0) !== (accum > 0)) accum = 0;
			accum += dy;
			if (accum >= down) { accum = 0; hidden = true; }
			else if (accum <= -up) { accum = 0; hidden = false; }
		};
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(evaluate);
		};
		last = readY();
		evaluate();
		target.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		const observer = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
		if (el) observer?.observe(el);
		return () => {
			target.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			observer?.disconnect();
			if (frame) cancelAnimationFrame(frame);
			frame = 0;
		};
	});

	$effect(() => {
		if (pinned || focusWithin) {
			accum = 0;
			hidden = false;
		}
	});

	$effect(() => {
		onHiddenChange?.(hidden);
	});
</script>

<div class="relative w-full min-w-0 overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}" {...rest} onfocusin={() => (focusWithin = true)} onfocusout={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focusWithin = false; }}>
	<div
		data-hidden={hidden ? 'true' : 'false'}
		style:height={`${barHeight}px`}
		style:transform={`translateY(${hidden ? -barHeight : 0}px)`}
		style:transition={slideTransition}
		class="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-white px-3 dark:bg-[#1D1D1A]"
	>
		{@render bar()}
		<span aria-hidden="true" style:opacity={atTop ? '0' : '1'} style:transition={fadeTransition} class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-stone-200 dark:bg-white/[0.16]"></span>
	</div>
	<div
		bind:this={scroller}
		tabindex="0"
		role="region"
		aria-label={label}
		style:max-height={`${maxHeight}px`}
		style:scroll-padding-top={`${barHeight + 8}px`}
		class="overflow-y-auto overscroll-y-contain outline-none [scrollbar-gutter:stable] focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.06] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
	>
		<div aria-hidden="true" style:height={`${barHeight}px`}></div>
		<div aria-hidden="true" class="pointer-events-none sticky top-0 -mb-5 h-5 bg-gradient-to-b from-white to-transparent dark:from-[#1D1D1A]"></div>
		{@render children()}
		<div aria-hidden="true" class="pointer-events-none sticky bottom-0 -mt-5 h-5 bg-gradient-to-t from-white to-transparent dark:from-[#1D1D1A]"></div>
	</div>
</div>
