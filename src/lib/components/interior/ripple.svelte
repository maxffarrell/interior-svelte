<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { RIPPLE_BASE } from './ripple.state.svelte';

	const EASE = [0.23, 1, 0.32, 1] as const;
	const BLOOM = { duration: 0.5, ease: 'linear' } as const;

	export type Props = Omit<HTMLButtonAttributes, 'children'> & {
		children: Snippet;
		onPress?: () => void;
		disabled?: boolean;
		max?: number;
		tintClass?: string;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { RippleState } from './ripple.state.svelte';

	let {
		children,
		onPress,
		disabled = false,
		max = 4,
		tintClass = 'bg-ink/15',
		class: className,
		...rest
	}: Props = $props();

	const ripple = new RippleState(() => ({ disabled, max }));
</script>

<button
	type="button"
	onclick={onPress}
	{...rest}
	{disabled}
	{@attach ripple.attach}
	class={cn(
		'mat-cap relative isolate inline-flex touch-manipulation items-center justify-center gap-2 rounded-[9px] px-3.5 py-2 text-[13px] font-medium text-ink-2 select-none disabled:opacity-50',
		className
	)}
>
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
	>
		{#each ripple.ripples as r (r.id)}
			<motion.span
				class={cn('absolute block size-10 rounded-full will-change-[transform,opacity]', tintClass)}
				style={{ left: r.x - RIPPLE_BASE / 2, top: r.y - RIPPLE_BASE / 2 }}
				initial={{ scale: reducedMotion.current ? r.scale : 0, opacity: 0 }}
				animate={{ scale: r.scale, opacity: r.released ? 0 : 1 }}
				transition={{
					scale: reducedMotion.current ? { duration: 0 } : BLOOM,
					opacity: {
						duration: r.released ? ripple.fadeDuration : 0.07,
						ease: r.released ? EASE : 'linear'
					}
				}}
			/>
		{/each}
	</span>

	<span class="relative">{@render children()}</span>
</button>
