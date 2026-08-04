<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		children: Snippet<[index: number]>;
		count: number;
		label: string;
		index?: number;
		defaultIndex?: number;
		onIndexChange?: (index: number) => void;
		gap?: number;
		peek?: number;
		momentum?: number;
		maxFlick?: number;
		prevLabel?: string;
		nextLabel?: string;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		children,
		count,
		label,
		index = $bindable<number | undefined>(undefined),
		defaultIndex = 0,
		onIndexChange,
		gap = 12,
		peek = 0,
		momentum = 0.14,
		maxFlick = 1,
		prevLabel = 'Previous slide',
		nextLabel = 'Next slide',
		class: className,
		...rest
	}: Props = $props();

	let internalIndex = $state(Math.max(0, Math.min(Math.max(1, count) - 1, defaultIndex)));
	let slideWidth = $state(0);
	let dragging = $state(false);
	let dragOffset = $state(0);
	let target = $state(0);
	let viewport = $state<HTMLDivElement | null>(null);
	let pointerId: number | null = null;
	let pointerStart = 0;
	let previousPointer = 0;
	let previousTime = 0;
	let velocity = 0;

	const total = $derived(Math.max(1, Math.floor(count)));
	const current = $derived(Math.max(0, Math.min(total - 1, index ?? internalIndex)));
	const shown = $derived(dragging ? target : current);
	const step = $derived(slideWidth + gap);
	const transition = $derived(reducedMotion.current || dragging ? 'none' : 'transform 260ms cubic-bezier(0.23, 1, 0.32, 1)');

	$effect(() => {
		if (!viewport) return;
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? 0;
			if (Math.abs(slideWidth - width) >= 0.5) slideWidth = width;
		});
		observer?.observe(viewport);
		if (!slideWidth) slideWidth = viewport.clientWidth;
		return () => observer?.disconnect();
	});

	function goTo(value: number) {
		const next = Math.max(0, Math.min(total - 1, Math.round(value)));
		target = next;
		dragOffset = 0;
		if (index === undefined) internalIndex = next;
		if (next !== current) onIndexChange?.(next);
	}

	function move(direction: 1 | -1) {
		const next = current + direction;
		if (next < 0 || next >= total) {
			dragOffset = direction === 1 ? -8 : 8;
			setTimeout(() => (dragOffset = 0), reducedMotion.current ? 0 : 180);
			return;
		}
		goTo(next);
	}

	function pick(velocityX: number) {
		if (!step) return current;
		const at = current - dragOffset / step;
		const anchor = Math.max(0, Math.min(total - 1, Math.round(at)));
		const projected = at - (velocityX * momentum) / step;
		return Math.max(0, Math.min(total - 1, Math.max(anchor - maxFlick, Math.min(anchor + maxFlick, Math.round(projected)))));
	}

	function onPointerDown(event: PointerEvent) {
		if (total < 2) return;
		pointerId = event.pointerId;
		pointerStart = event.clientX;
		previousPointer = event.clientX;
		previousTime = performance.now();
		velocity = 0;
		dragging = true;
		target = current;
		viewport?.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		event.preventDefault();
		const now = performance.now();
		const dx = event.clientX - pointerStart;
		dragOffset = dx;
		const dt = Math.max(1, now - previousTime);
		velocity = ((event.clientX - previousPointer) / dt) * 16;
		previousPointer = event.clientX;
		previousTime = now;
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		dragging = false;
		viewport?.releasePointerCapture(event.pointerId);
		pointerId = null;
		goTo(pick(velocity));
	}

	function onKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
		else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
		else if (event.key === 'Home') { event.preventDefault(); goTo(0); }
		else if (event.key === 'End') { event.preventDefault(); goTo(total - 1); }
	}
</script>

<div class="w-full {className ?? ''}" {...rest}>
	<div
		bind:this={viewport}
		tabindex="0"
		role="group"
		aria-label={label}
		aria-roledescription="carousel"
		onkeydown={onKeyDown}
		onscroll={(event) => { event.currentTarget.scrollLeft = 0; event.currentTarget.scrollTop = 0; }}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
		style={`padding-left:${peek}px;padding-right:${peek}px;${peek ? `-webkit-mask-image:linear-gradient(to right, transparent 0, black ${peek + 14}px, black calc(100% - ${peek + 14}px), transparent 100%);mask-image:linear-gradient(to right, transparent 0, black ${peek + 14}px, black calc(100% - ${peek + 14}px), transparent 100%);` : ''}`}
		class="relative overflow-hidden rounded-[14px] py-1.5 outline-none touch-pan-y focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
	>
		<div class="flex items-stretch {dragging ? 'cursor-grabbing' : 'cursor-grab'}" style:gap={`${gap}px`} style:transform={`translateX(${-current * step + dragOffset}px)`} style:transition={transition}>
			{#each Array.from({ length: total }) as _, i (i)}
				<div
					role="group"
					aria-roledescription="slide"
					aria-label={`${i + 1} of ${total}`}
					inert={i !== current}
					class="w-full shrink-0 select-none transition-[opacity,transform] duration-260 {i === shown ? 'scale-100 opacity-100' : 'scale-[0.96] opacity-[0.55]'}"
				>
					{@render children(i)}
				</div>
			{/each}
		</div>
	</div>
	<div class="mt-3 flex items-center justify-between gap-3">
		<span class="flex items-center gap-[3px]">
			{#each Array.from({ length: total }) as _, i (i)}
				<button type="button" onclick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`} aria-current={i === current ? 'true' : undefined} class="grid h-[18px] w-[16px] place-items-center rounded-[5px] outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]">
					<span class="block h-[5px] w-[14px] rounded-[1.5px] bg-stone-800 transition-[transform,opacity] duration-260 dark:bg-stone-100 {i === shown ? 'scale-x-100 opacity-100' : 'scale-x-[0.36] opacity-[0.26]'}"></span>
				</button>
			{/each}
		</span>
		<span class="flex items-center gap-1.5">
			<button type="button" onclick={() => move(-1)} aria-label={prevLabel} class="grid size-7 place-items-center rounded-[6px] border border-stone-200 bg-white text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:bg-stone-50 active:translate-y-px focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#252522] dark:text-stone-200 dark:hover:bg-[#2A2A27] dark:focus-visible:border-[#93B0FF]"><svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true"><polyline points="160 208 80 128 160 48" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
			<button type="button" onclick={() => move(1)} aria-label={nextLabel} class="grid size-7 place-items-center rounded-[6px] border border-stone-200 bg-white text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 hover:bg-stone-50 active:translate-y-px focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#252522] dark:text-stone-200 dark:hover:bg-[#2A2A27] dark:focus-visible:border-[#93B0FF]"><svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true"><polyline points="96 48 176 128 96 208" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
		</span>
	</div>
	<span class="sr-only">Left and right arrow keys move between {total} slides.</span>
	<span aria-live="polite" aria-atomic="true" class="sr-only">Slide {current + 1} of {total}</span>
</div>
