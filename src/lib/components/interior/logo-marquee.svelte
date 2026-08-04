<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type MarqueeDirection = 'left' | 'right';
	export type LogoMarqueeItem = { id: string; label: string; href?: string; mark?: Snippet };
	export type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
		items: LogoMarqueeItem[];
		label?: string;
		speed?: number;
		direction?: MarqueeDirection;
		gap?: number;
		paused?: boolean;
		onSelect?: (item: LogoMarqueeItem) => void;
	};
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const MAX_COPIES = 14;
	const RAMP = 0.19;
	const SETTLE = 0.16;
	const FACE = 'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-[9px] px-3 text-[13px] font-medium tracking-[-0.01em] text-stone-500 dark:text-stone-400';
	const HIT = 'outline-none transition-colors duration-150 hover:text-stone-700 focus-visible:bg-[#4568FF]/[0.06] focus-visible:text-stone-700 focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:hover:text-stone-200 dark:focus-visible:bg-[#93B0FF]/[0.10] dark:focus-visible:text-stone-200 dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]';

	let { items, label = 'Logos', speed = 44, direction = 'left', gap = 40, paused = false, onSelect, class: className, ...rest }: Props = $props();
	let viewport: HTMLDivElement | null = null;
	let track: HTMLDivElement | null = null;
	let group: HTMLUListElement | null = null;
	let copies = $state(4);
	let held = $state(false);
	let near = $state(false);
	let offset = 0;
	let nudge = 0;
	let rate = 0;
	let span = 0;

	const stopped = $derived(held || paused);
	const live = $derived(reducedMotion.current ? 0 : 1);

	function paint() {
		if (track) track.style.transform = `translate3d(${(reducedMotion.current ? 0 : offset - span).toFixed(2)}px, 0, 0)`;
	}
	function fold(value: number, loop: number) {
		const mod = value % loop;
		return mod > 0 ? mod - loop : mod;
	}
	function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }

	$effect(() => {
		if (!viewport || !group) return;
		const measure = () => {
			const width = group?.getBoundingClientRect().width ?? 0;
			const loop = width > 0 ? width + gap : 0;
			span = loop;
			offset = loop > 0 ? clamp(offset, -loop, loop) : 0;
			paint();
			const room = viewport?.getBoundingClientRect().width ?? 0;
			const next = reducedMotion.current || loop <= 0 ? 4 : clamp(Math.ceil(room / loop) + 3, 4, MAX_COPIES);
			if (copies !== next) copies = next;
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(measure);
		observer.observe(viewport);
		observer.observe(group);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!viewport) return;
		if (typeof IntersectionObserver === 'undefined') {
			near = true;
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			const entry = entries[entries.length - 1];
			if (entry) near = entry.isIntersecting;
		}, { rootMargin: '96px' });
		observer.observe(viewport);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (reducedMotion.current || !near) return;
		let frame = 0;
		let last = 0;
		const sign = direction === 'right' ? 1 : -1;
		const tick = (now: number) => {
			const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
			last = now;
			if (span > 0) {
				rate += (((stopped ? 0 : 1) - rate) * (1 - Math.exp(-dt / RAMP)));
				const pull = nudge * (1 - Math.exp(-dt / SETTLE));
				nudge -= pull;
				let next = offset + sign * speed * rate * dt + pull;
				if (rate > 0.002 && Math.abs(nudge) < 0.25) {
					nudge = 0;
					next = fold(next, span);
				} else next = clamp(next, -span, span);
				offset = next;
				paint();
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (!viewport) return;
		const pin = () => {
			if (reducedMotion.current) return;
			if (viewport?.scrollLeft) viewport.scrollLeft = 0;
			if (viewport?.scrollTop) viewport.scrollTop = 0;
		};
		viewport.addEventListener('scroll', pin, { passive: true });
		return () => viewport?.removeEventListener('scroll', pin);
	});

	function reveal(node: HTMLElement) {
		if (!viewport || reducedMotion.current || span <= 0 || node === viewport) return;
		const view = viewport.getBoundingClientRect();
		const box = node.getBoundingClientRect();
		const pad = 12;
		let delta = 0;
		if (box.left < view.left + pad) delta = view.left + pad - box.left;
		else if (box.right > view.right - pad) delta = view.right - pad - box.right;
		if (delta) {
			const target = clamp(offset + nudge + delta, -span, span);
			nudge = target - offset;
		}
	}
</script>

<section {...rest} aria-label={label} class="relative isolate w-full min-w-0 max-w-full overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}" onpointerenter={(event) => { if (event.pointerType !== 'touch') held = true; }} onpointerleave={() => (held = false)} onpointerdown={() => (held = true)} onpointerup={(event) => { if (event.pointerType === 'touch') held = false; }} onpointercancel={() => (held = false)} onfocusin={(event) => { held = true; reveal(event.target as HTMLElement); }} onfocusout={() => (held = false)}>
	<div bind:this={viewport} tabindex={reducedMotion.current ? 0 : undefined} style:overflow-x={reducedMotion.current ? 'auto' : 'hidden'} class="overflow-y-hidden py-2 outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.10] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]">
		<div bind:this={track} style:gap={`${gap}px`} style:will-change="transform" class="flex w-max items-center">
			{#each Array.from({ length: reducedMotion.current ? 1 : copies }) as _, copy (copy)}
				<ul bind:this={group} aria-hidden={copy === live ? undefined : true} style:gap={`${gap}px`} class="flex w-max items-center">
					{#each items as item (item.id)}
						<li class="shrink-0">
							{#if copy !== live}
								<span class={FACE}>{#if item.mark}{@render item.mark()}{:else}{item.label}{/if}</span>
							{:else if item.href}
								<a href={item.href} class="{FACE} {HIT}">{#if item.mark}<span aria-hidden="true">{@render item.mark()}</span><span class="sr-only">{item.label}</span>{:else}{item.label}{/if}</a>
							{:else if onSelect}
								<button type="button" onclick={() => onSelect?.(item)} class="{FACE} {HIT}">{#if item.mark}<span aria-hidden="true">{@render item.mark()}</span><span class="sr-only">{item.label}</span>{:else}{item.label}{/if}</button>
							{:else}
								<span class={FACE}>{#if item.mark}<span aria-hidden="true">{@render item.mark()}</span><span class="sr-only">{item.label}</span>{:else}{item.label}{/if}</span>
							{/if}
						</li>
					{/each}
				</ul>
			{/each}
		</div>
	</div>
	<div aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-white/0 dark:from-stone-900 dark:to-stone-900/0"></div>
	<div aria-hidden="true" class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-white/0 dark:from-stone-900 dark:to-stone-900/0"></div>
</section>
