<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		ready: boolean;
		children: Snippet;
		lines?: number;
		lineHeight?: number;
		barHeight?: number;
		reserve?: number;
		delay?: number;
		minVisible?: number;
		label?: string;
		skeleton?: Snippet;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion, AnimatePresence } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const WIDTHS = [100, 93, 97, 88, 95, 91] as const;

	let {
		ready,
		children,
		lines = 3,
		lineHeight = 21,
		barHeight = 9,
		reserve,
		delay = 120,
		minVisible = 380,
		label,
		skeleton,
		ref: _ref,
		class: className,
		...rest
	}: Props = $props();

	let showSkeleton = $state(false);
	let shownAt = 0;
	let shell: HTMLDivElement | null = null;
	let body: HTMLDivElement | null = null;
	let scrollable = $state(false);

	const widthFor = (index: number) =>
		lines > 1 && index === lines - 1 ? 62 : WIDTHS[(index * 7 + 3) % WIDTHS.length];

	$effect(() => {
		if (!ready) {
			if (showSkeleton) return;
			const timer = setTimeout(() => {
				shownAt = performance.now();
				showSkeleton = true;
			}, delay);
			return () => clearTimeout(timer);
		}

		if (!showSkeleton) return;
		const restTime = Math.max(0, minVisible - (performance.now() - shownAt));
		const timer = setTimeout(() => (showSkeleton = false), restTime);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (!shell || typeof ResizeObserver === 'undefined') return;
		const check = () => {
			if (shell) scrollable = shell.scrollHeight - shell.clientHeight > 1;
		};
		check();
		const observer = new ResizeObserver(check);
		observer.observe(shell);
		if (body) observer.observe(body);
		return () => observer.disconnect();
	});

	const box = $derived(reserve ?? lines * lineHeight);
	const transition = $derived(reducedMotion.current ? { duration: 0 } : CROSSFADE);
</script>

<div
	{...rest}
	bind:this={shell}
	aria-busy={!ready}
	aria-label={label}
	tabindex={scrollable ? 0 : undefined}
	style:height={`${box}px`}
	class="relative grid overflow-y-auto overscroll-contain text-stone-700 dark:text-stone-200 {className ?? ''}"
>
		<motion.div
			class="col-start-1 row-start-1 min-w-0"
		initial={false}
		animate={
			reducedMotion.current
				? { opacity: showSkeleton ? 0 : 1 }
				: {
						opacity: showSkeleton ? 0 : 1,
						scale: showSkeleton ? 0.99 : 1,
						filter: showSkeleton ? 'blur(4px)' : 'blur(0px)'
					}
		}
		transition={transition}
		style={`transform-origin: top left; pointer-events: ${showSkeleton ? 'none' : 'auto'}`}
	>
		{@render children()}
	</motion.div>

	<AnimatePresence initial={false}>
		{#if showSkeleton}
			<motion.div
				key="skeleton"
				aria-hidden="true"
				class="pointer-events-none col-start-1 row-start-1 w-full self-start"
				initial={reducedMotion.current ? { opacity: 1 } : { opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, filter: 'blur(3px)' }}
				transition={transition}
			>
				{#if skeleton}
					{@render skeleton()}
				{:else}
					<div class="w-full">
						{#each Array.from({ length: lines }) as _, index (index)}
							<div class="flex items-center" style:height={`${lineHeight}px`}>
								<div
									class="rounded-[5px] bg-stone-200 dark:bg-white/15"
									style:height={`${barHeight}px`}
									style:width={`${widthFor(index)}%`}
								></div>
							</div>
						{/each}
					</div>
				{/if}
			</motion.div>
		{/if}
	</AnimatePresence>

	{#if label}
		<span role="status" class="sr-only">{ready ? `${label} loaded` : ''}</span>
	{/if}
</div>
