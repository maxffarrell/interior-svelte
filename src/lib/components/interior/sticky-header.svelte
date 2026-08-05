<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		title: string;
		children: Snippet;
		subtitle?: string;
		leading?: Snippet;
		actions?: Snippet;
		expandedHeight?: number;
		compactHeight?: number;
		maxHeight?: number;
	};
</script>

<script lang="ts">
	import { motion, useMotionValue, useSpring, useTransform } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const SMOOTH = { stiffness: 240, damping: 44, mass: 0.6 } as const;

	let {
		title,
		children,
		subtitle,
		leading,
		actions,
		expandedHeight = 68,
		compactHeight = 48,
		maxHeight = 320,
		class: className,
		...rest
	}: Props = $props();

	let scroller = $state<HTMLDivElement | null>(null);
	let tracked = $state(0);
	const progress = useMotionValue(0);
	const sprung = useSpring(progress, SMOOTH);
	const tall = $derived(Math.max(expandedHeight, compactHeight));
	const short = $derived(Math.min(expandedHeight, compactHeight));
	const travel = $derived(Math.max(1, tall - short));
	const range = $derived(Math.max(64, travel * 3));
	const condensed = $derived(tracked >= 1);
	const plate = useTransform(sprung, (value) => (tall - travel * Number(value)) / tall);
	const edge = useTransform(sprung, (value) => tall - travel * Number(value));
	const lifted = useTransform(sprung, (value) => Math.min(1, Math.max(0, Number(value) / 0.12)));
	const bigY = useTransform(sprung, (value) => -travel * Number(value));
	const bigOpacity = useTransform(sprung, (value) => Math.min(1, Math.max(0, 1 - Number(value) / 0.45)));
	const bigScale = useTransform(sprung, (value) => 1 - 0.05 * Number(value));
	const smallOpacity = useTransform(sprung, (value) => Math.min(1, Math.max(0, (Number(value) - 0.55) / 0.35)));
	const smallY = useTransform(smallOpacity, (value) => (1 - Number(value)) * 6);

	function update() {
		if (!scroller) return;
		tracked = Math.min(1, Math.max(0, scroller.scrollTop / Math.max(1, range)));
		if (reducedMotion.current) sprung.jump(tracked);
		else progress.set(tracked);
	}

	$effect(() => {
		if (scroller) update();
	});
</script>

<div class="relative overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}" {...rest}>
	<div
		bind:this={scroller}
		tabindex="0"
		role="region"
		aria-label={title}
		style:max-height={`${maxHeight}px`}
		style:scroll-padding-top={`${short + 10}px`}
		onscroll={update}
		class="overflow-y-auto overscroll-y-contain outline-none [scrollbar-gutter:stable] focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.06] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
	>
		<div aria-hidden="true" style:height={`${tall}px`}></div>
		{@render children()}
		<div aria-hidden="true" class="pointer-events-none sticky bottom-0 -mt-6 h-6 bg-gradient-to-t from-white to-transparent dark:from-[#1D1D1A]"></div>
	</div>
	<header data-condensed={condensed ? 'true' : 'false'} style:height={`${tall}px`} class="pointer-events-none absolute inset-x-0 top-0">
		<motion.div aria-hidden="true" style={{ height: tall, scaleY: reducedMotion.current ? (tall - travel * tracked) / tall : plate }} class="absolute inset-x-0 top-0 origin-top bg-white dark:bg-[#1D1D1A]"></motion.div>
		<motion.div aria-hidden="true" style={{ y: reducedMotion.current ? tall - travel * tracked : edge, opacity: reducedMotion.current ? Math.min(1, tracked / 0.12) : lifted }} class="absolute inset-x-0 top-0 h-px shadow-[0_6px_16px_-10px_rgba(28,25,23,0.4)] dark:shadow-[0_6px_16px_-10px_rgba(0,0,0,0.7)]"></motion.div>
		<motion.div aria-hidden="true" style={{ y: reducedMotion.current ? tall - travel * tracked : edge, opacity: reducedMotion.current ? Math.min(1, tracked / 0.12) : lifted }} class="absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white to-transparent dark:from-[#1D1D1A]"></motion.div>
		<motion.div aria-hidden="true" style={{ y: reducedMotion.current ? tall - travel * tracked : edge, opacity: reducedMotion.current ? Math.min(1, tracked / 0.12) : lifted }} class="absolute inset-x-0 top-0 h-px bg-stone-200 dark:bg-white/[0.16]"></motion.div>
		<div class="absolute inset-x-0 top-0 flex items-start gap-2.5 px-4 pt-3">
			{#if leading}<div class="pointer-events-auto flex h-6 shrink-0 items-center">{@render leading()}</div>{/if}
			<div class="relative min-w-0 flex-1">
				<motion.div style={{ y: reducedMotion.current ? -travel * tracked : bigY, opacity: reducedMotion.current ? Math.max(0, 1 - tracked / 0.45) : bigOpacity, scale: reducedMotion.current ? 1 - 0.05 * tracked : bigScale, transformOrigin: 'left top' }}>
					<h2 class="truncate text-[20px] font-medium leading-[1.2] tracking-[-0.03em] text-stone-800 dark:text-stone-100">{title}</h2>
					{#if subtitle}<p class="mt-0.5 truncate text-[11.5px] leading-[1.35] text-stone-500 dark:text-stone-400">{subtitle}</p>{/if}
				</motion.div>
				<motion.span aria-hidden="true" style={{ opacity: reducedMotion.current ? Math.min(1, Math.max(0, (tracked - 0.55) / 0.35)) : smallOpacity, y: reducedMotion.current ? 6 * (1 - Math.min(1, Math.max(0, (tracked - 0.55) / 0.35))) : smallY }} class="absolute inset-x-0 top-[3px] truncate text-[13px] font-medium leading-[1.4] text-stone-700 dark:text-stone-200">{title}</motion.span>
			</div>
			{#if actions}<div class="pointer-events-auto flex h-6 shrink-0 items-center gap-1.5">{@render actions()}</div>{/if}
		</div>
	</header>
</div>
