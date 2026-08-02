<script lang="ts" module>
	import type { ComponentProps } from 'svelte';
	import { motion } from 'motion-sv';
	import type { LikeCommit } from './like-burst.state.svelte';

	export type Props = Omit<ComponentProps<typeof motion.button>, 'children' | 'onerror'> & {
		initialLiked?: boolean;
		initialCount?: number;
		onCommit?: LikeCommit;
		onError?: (error: unknown) => void;
		onToggle?: (liked: boolean) => void;
		settle?: number;
		label?: string;
		activeLabel?: string;
		format?: (value: number) => string;
	};

	const EASE = [0.23, 1, 0.32, 1] as const;
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const INSTANT = { duration: 0 } as const;

	const HEART = 'M12 20.3 4.3 12.6a4.8 4.8 0 0 1 6.8-6.8l.9.9.9-.9a4.8 4.8 0 0 1 6.8 6.8Z';

	const SPARKS = Array.from({ length: 8 }, (_, i) => {
		const h = (((i + 1) * 2654435761) % 997) / 997;
		const angle = (i / 8) * Math.PI * 2 - Math.PI / 2 + (h - 0.5) * 0.4;
		const distance = 13 + h * 9;
		return {
			x: Math.round(Math.cos(angle) * distance * 10) / 10,
			y: Math.round(Math.sin(angle) * distance * 10) / 10,
			size: h > 0.5 ? 4 : 3,
			delay: Math.round(h * 50) / 1000
		};
	});

	const DEFAULT_FORMAT = (value: number) => new Intl.NumberFormat('en-US').format(value);
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { OptimisticLikeState } from './like-burst.state.svelte';

	let {
		initialLiked = false,
		initialCount = 0,
		onCommit,
		onError,
		onToggle,
		settle = 400,
		label = 'Like',
		activeLabel = 'Liked',
		format = DEFAULT_FORMAT,
		disabled = false,
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const like = new OptimisticLikeState(() => ({
		initialLiked,
		initialCount,
		onCommit,
		onError,
		settle
	}));

	const liked = $derived(like.liked);
	const pending = $derived(like.pending);
	const burst = $derived(like.burst);
	const settled = $derived(like.settled);

	const fade = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
	const cell = $derived(reducedMotion.current ? INSTANT : CELL);
	const travel = $derived(reducedMotion.current ? 0 : 7);

	const low = $derived(format(like.base));
	const high = $derived(format(like.base + 1));
	const widest = $derived(high.length >= low.length ? high : low);

	export const toggle = like.toggle;

	function press() {
		const next = !liked;
		like.toggle();
		onToggle?.(next);
	}
</script>

<motion.button
	type="button"
	aria-label={label}
	{...rest}
	bind:ref
	{disabled}
	aria-pressed={liked}
	aria-busy={pending || undefined}
	onclick={press}
	class={cn(
		'mat-cap inline-flex h-9 touch-manipulation items-center gap-2 rounded-[9px] px-3 text-[13px] font-medium text-ink-2 select-none disabled:opacity-50',
		className
	)}
>
	<span aria-hidden="true" class="relative block size-4.5">
		<motion.svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.7"
			stroke-linejoin="round"
			class="absolute inset-0 size-4.5 text-ink-3 focus:outline-none"
			initial={false}
			animate={{ opacity: liked ? 0 : 1 }}
			transition={fade}
		>
			<path d={HEART} />
		</motion.svg>

		<motion.svg
			viewBox="0 0 24 24"
			fill="currentColor"
			class="absolute inset-0 size-4.5 text-ink focus:outline-none"
			initial={false}
			animate={{ opacity: liked ? 1 : 0, scale: liked ? 1 : 0.55 }}
			transition={cell}
		>
			<path d={HEART} />
		</motion.svg>

		{#if !reducedMotion.current && burst > 0}
			{#key burst}
				<span class="pointer-events-none absolute top-1/2 left-1/2 block size-0">
					{#each SPARKS as spark (spark)}
						<motion.span
							data-spark={spark.size}
							class="absolute block rounded-[1.5px] bg-ink data-[spark=3]:mt-[-1.5px] data-[spark=3]:ml-[-1.5px] data-[spark=3]:size-0.75 data-[spark=4]:-mt-0.5 data-[spark=4]:-ml-0.5 data-[spark=4]:size-1"
							initial={{ x: 0, y: 0, scale: 0.6, opacity: 0.85 }}
							animate={{ x: spark.x, y: spark.y, scale: 1, opacity: 0 }}
							transition={{ duration: 0.44, delay: spark.delay, ease: EASE }}
						></motion.span>
					{/each}
				</span>
			{/key}
		{/if}
	</span>

	<span aria-hidden="true" class="grid">
		<motion.span
			class="col-start-1 row-start-1"
			initial={false}
			animate={{ opacity: liked ? 0 : 1 }}
			transition={fade}
		>
			{label}
		</motion.span>
		<motion.span
			class="col-start-1 row-start-1"
			initial={false}
			animate={{ opacity: liked ? 1 : 0 }}
			transition={fade}
		>
			{activeLabel}
		</motion.span>
	</span>

	<span aria-hidden="true" class="grid overflow-hidden text-[12px] text-ink-3 tabular-nums">
		<span class="invisible col-start-1 row-start-1">{widest}</span>
		<motion.span
			class="col-start-1 row-start-1 justify-self-end"
			initial={false}
			animate={{ opacity: liked ? 0 : 1, y: liked ? travel : 0 }}
			transition={fade}
		>
			{low}
		</motion.span>
		<motion.span
			class="col-start-1 row-start-1 justify-self-end"
			initial={false}
			animate={{ opacity: liked ? 1 : 0, y: liked ? 0 : -travel }}
			transition={fade}
		>
			{high}
		</motion.span>
	</span>
</motion.button>

<span role="status" aria-live="polite" class="sr-only">
	{format(settled.count)} likes, {settled.liked ? 'liked' : 'not liked'}
</span>
