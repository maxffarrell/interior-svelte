<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Tab = { value: string; label: string };
	export type Props = HTMLAttributes<HTMLDivElement> & {
		items?: Tab[];
		value?: string;
		onChange?: (value: string) => void;
	};
</script>

<script lang="ts">
	import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let {
		items = [
			{ value: 'one', label: 'Overview' },
			{ value: 'two', label: 'Details' },
			{ value: 'three', label: 'Activity' }
		],
		value = $bindable(items[0]?.value ?? ''),
		onChange,
		class: className,
		...rest
	}: Props = $props();
	let active = $derived(items.find((item) => item.value === value)?.value ?? items[0]?.value ?? '');
	let activeIndex = $derived(Math.max(0, items.findIndex((item) => item.value === active)));
	const indicator = useMotionValue(activeIndex);
	const indicatorX = useTransform(indicator, (v) => `${v * 100}%`);
	$effect(() => {
		if (reducedMotion.current) indicator.set(activeIndex);
		else { const controls = animate(indicator, activeIndex, { type: 'spring', stiffness: 620, damping: 42, mass: 0.35 }); return () => controls.stop(); }
	});
	function select(next: string) {
		value = next;
		onChange?.(next);
	}
</script>

<div {...rest} class="grid gap-4 {className ?? ''}">
	<div role="tablist" class="mat-well relative grid rounded-[10px] p-1" style:grid-template-columns={`repeat(${Math.max(1, items.length)}, minmax(0, 1fr))`}>
		<motion.div aria-hidden="true" class="mat-cap pointer-events-none absolute inset-y-1 left-1 rounded-[7px]" style={{ width: `calc((100% - 0.5rem) / ${Math.max(1, items.length)})`, x: indicatorX }} initial={false}></motion.div>
		{#each items as item (item.value)}
			<button
				type="button"
				role="tab"
				aria-selected={active === item.value}
				onclick={() => select(item.value)}
				class="relative z-1 rounded-[7px] px-3 py-2 text-[12px] text-ink-3 transition-colors data-[active=true]:text-ink"
				data-active={active === item.value}
			>
				<span class="relative">{item.label}</span>
			</button>
		{/each}
	</div>
	<AnimatePresence initial={false}>{#key active}<motion.div initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, x: -12 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 38, mass: 0.8 }} class="mat-panel rounded-[12px] p-4 text-[13px] leading-relaxed text-ink-2">{items.find((item) => item.value === active)?.label} content</motion.div>{/key}</AnimatePresence>
</div>
