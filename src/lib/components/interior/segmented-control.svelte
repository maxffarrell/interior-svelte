<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Segment = { value: string; label: string };
	export type Props = HTMLAttributes<HTMLDivElement> & {
		items?: Segment[];
		value?: string;
		onChange?: (value: string) => void;
	};
</script>

<script lang="ts">
	import { animate, motion, useMotionValue, useTransform } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let {
		items = [
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' },
			{ value: 'year', label: 'Year' }
		],
		value = $bindable(items[0]?.value ?? ''),
		onChange,
		class: className,
		...rest
	}: Props = $props();
	function select(next: string) {
		value = next;
		onChange?.(next);
	}
	const index = $derived(Math.max(0, items.findIndex((item) => item.value === value)));
	const position = useMotionValue(index);
	const thumbX = useTransform(position, (v) => `${v * 100}%`);
	const maskX = useTransform(position, (v) => `${v * -100}%`);
	$effect(() => {
		if (reducedMotion.current) position.set(index);
		else { const controls = animate(position, index, { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 }); return () => controls.stop(); }
	});
</script>


<div {...rest} role="radiogroup" aria-label="{items.map((item) => item.label).join(', ')}" class="mat-well inline-block select-none rounded-[10px] p-1 {className ?? ''}">
	<div class="relative grid" style:grid-template-columns={`repeat(${Math.max(1, items.length)}, minmax(0, 1fr))`}>
		{#each items as item (item.value)}<span aria-hidden="true" class="pointer-events-none px-3 py-[7px] text-center text-[12px] whitespace-nowrap text-ink-3">{item.label}</span>{/each}
		<motion.div aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 overflow-hidden rounded-[7px] bg-ink shadow-[0_1px_2px_rgba(0,0,0,0.2)]" style={{ width: `${100 / Math.max(1, items.length)}%`, x: thumbX }} initial={false}>
			<motion.div class="absolute inset-0" style={{ x: maskX }} initial={false}><div class="absolute inset-y-0 left-0 grid" style:width={`${items.length * 100}%`} style:grid-template-columns={`repeat(${Math.max(1, items.length)}, minmax(0, 1fr))`}>{#each items as item (item.value)}<span class="px-3 py-[7px] text-center text-[12px] whitespace-nowrap text-white">{item.label}</span>{/each}</div></motion.div>
		</motion.div>
		<div class="absolute inset-0 grid" style:grid-template-columns={`repeat(${Math.max(1, items.length)}, minmax(0, 1fr))`}>
	{#each items as item (item.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === item.value}
			onclick={() => select(item.value)}
			class="rounded-[7px] outline-none focus-visible:shadow-[inset_0_0_0_1px_#4568FF]"
		>
			<span class="sr-only">{item.label}</span>
		</button>
	{/each}
		</div>
	</div>
</div>
