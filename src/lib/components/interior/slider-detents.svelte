<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type SliderDetent = { value: number; label?: string };
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		value: number;
		onValueChange: (value: number) => void;
		min?: number;
		max?: number;
		step?: number;
		detents?: readonly (number | SliderDetent)[];
		pull?: number;
		label?: string;
		format?: (value: number) => string;
		disabled?: boolean;
		haptic?: boolean;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion, useSpring } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const THUMB = 18;
	const GRAB = { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 } as const;
	const CARRIAGE = { stiffness: 520, damping: 34, mass: 0.45 } as const;
	const INSTANT = { duration: 0 } as const;
	const plain = (value: number) => String(value);
	const tidy = (value: number) => Math.round(value * 1e6) / 1e6;

	let { value, onValueChange, min = 0, max = 100, step = 1, detents = [], pull, label = 'Value', format = plain, disabled = false, haptic = true, class: className, ...rest }: Props = $props();
	let track: HTMLDivElement | null = null;
	let dragging = $state(false);
	let held = false;
	let marked = -1;
	const list = $derived(detents.map((detent) => typeof detent === 'number' ? { value: detent } : detent));
	const range = $derived(max - min);
	const grab = $derived(pull ?? range * 0.045);
	const percent = $derived(range > 0 ? Math.min(1, Math.max(0, (value - min) / range)) : 0);
	const activeDetent = $derived(list.findIndex((detent) => tidy(detent.value) === tidy(value)));
	const suffix = $derived(list[activeDetent]?.label ?? '');
	const carriage = useSpring(0, CARRIAGE);
	const widest = $derived([format(min), format(max), ...list.map((detent) => detent.label ? `${format(detent.value)} · ${detent.label}` : format(detent.value))].reduce((a, b) => b.length > a.length ? b : a, ''));

	$effect(() => {
		const target = percent * 100;
		if (reducedMotion.current) carriage.jump(target);
		else carriage.set(target);
	});

	function commit(next: number) {
		const settled = Math.min(max, Math.max(min, tidy(next)));
		const index = list.findIndex((detent) => tidy(detent.value) === settled);
		if (index !== marked) {
			marked = index;
			if (haptic && index >= 0) navigator.vibrate?.(6);
		}
		if (settled !== value) onValueChange(settled);
	}

	function capture(clientX: number) {
		if (!track || range <= 0) return null;
		const rect = track.getBoundingClientRect();
		const travel = rect.width - THUMB;
		if (travel <= 0) return null;
		const ratio = (clientX - rect.left - THUMB / 2) / travel;
		const raw = Math.min(max, Math.max(min, min + ratio * range));
		let nearest = grab;
		let target: number | undefined;
		for (const detent of list) {
			const distance = Math.abs(raw - detent.value);
			if (distance <= nearest) {
				nearest = distance;
				target = detent.value;
			}
		}
		return target ?? min + Math.round((raw - min) / step) * step;
	}

	function toDetent(direction: number) {
		const sorted = list.map((detent) => detent.value).toSorted((a, b) => a - b);
		const target = direction > 0 ? sorted.find((detent) => detent > value + 1e-6) : sorted.findLast((detent) => detent < value - 1e-6);
		commit(target ?? (direction > 0 ? max : min));
	}

	function pointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }) {
		if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		event.currentTarget.focus({ preventScroll: true });
		held = true;
		dragging = true;
		const next = capture(event.clientX);
		if (next !== null) commit(next);
	}
	function pointermove(event: PointerEvent) {
		if (!held) return;
		const next = capture(event.clientX);
		if (next !== null) commit(next);
	}
	function release() { held = false; dragging = false; }
	function keydown(event: KeyboardEvent) {
		if (disabled) return;
		const forward = event.key === 'ArrowRight' || event.key === 'ArrowUp';
		const back = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
		if (forward || back) {
			if (event.shiftKey) toDetent(forward ? 1 : -1);
			else commit(value + (forward ? step : -step));
		}
		else if (event.key === 'PageUp') toDetent(1);
		else if (event.key === 'PageDown') toDetent(-1);
		else if (event.key === 'Home') commit(min);
		else if (event.key === 'End') commit(max);
		else return;
		event.preventDefault();
	}
	$effect(() => {
		const bail = () => release();
		window.addEventListener('blur', bail);
		return () => window.removeEventListener('blur', bail);
	});
</script>

<div {...rest} class={cn('w-full select-none', className)}>
	<div class="mb-2.5 flex items-baseline justify-between gap-3">
		<span id="slider-detents-label" class="text-[12.5px] text-ink-3">{label}</span>
		<span class="grid justify-items-start"><span aria-hidden="true" class="invisible col-start-1 row-start-1 whitespace-pre font-mono text-[11px]">{widest}</span><span class="col-start-1 row-start-1 whitespace-pre font-mono text-[11px] tabular-nums text-ink-2">{format(value)}{#if suffix}<motion.span initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={reducedMotion.current ? INSTANT : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }} class="text-ink-3"> · {suffix}</motion.span>{/if}</span></span>
	</div>
	<div
		bind:this={track}
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-orientation="horizontal"
		aria-valuemin={min}
		aria-valuemax={max}
		aria-valuenow={value}
		aria-valuetext={suffix ? `${format(value)}, ${suffix}` : format(value)}
		aria-labelledby="slider-detents-label"
		aria-disabled={disabled || undefined}
		onpointerdown={pointerdown}
		onpointermove={pointermove}
		onpointerup={release}
		onpointercancel={release}
		onlostpointercapture={release}
		onkeydown={keydown}
		style="touch-action:none"
		class={cn('relative h-9 w-full rounded-[9px] outline-none focus-visible:bg-accent/6 focus-visible:shadow-[inset_0_0_0_1px_theme(colors.accent)]', disabled ? 'pointer-events-none opacity-50' : dragging ? 'cursor-grabbing' : 'cursor-grab')}
	>
		<div class="pointer-events-none absolute inset-x-0 top-[9px] h-[10px] overflow-hidden rounded-[5px] bg-well"><div class="absolute inset-y-0" style="left:{THUMB / 2}px;right:{THUMB / 2}px"><motion.div class="absolute inset-y-0 left-0 right-0" style={{ x: carriage }}><div class="absolute inset-y-0 right-full w-[2000px] bg-ink" /></motion.div></div></div>
		<div class="pointer-events-none absolute inset-y-0" style="left:{THUMB / 2}px;right:{THUMB / 2}px">{#each list as detent (String(detent.value))}<span aria-hidden class="absolute top-[26px] block h-[5px] w-[2px] -translate-x-1/2 bg-ink/35" style="left:{range > 0 ? ((detent.value - min) / range) * 100 : 0}%" />{/each}</div>
		<div class="pointer-events-none absolute inset-y-0" style="left:{THUMB / 2}px;right:{THUMB / 2}px"><motion.div class="absolute inset-y-0 left-0 right-0" style={{ x: carriage }}><motion.div class="absolute top-[4px] h-[20px] w-[18px] rounded-[6px] border-2 border-panel bg-ink" style="margin-left:{-THUMB / 2}px" initial={false} animate={{ scale: dragging ? 1.08 : 1 }} transition={reducedMotion.current ? INSTANT : GRAB} /></motion.div></div>
	</div>
</div>
