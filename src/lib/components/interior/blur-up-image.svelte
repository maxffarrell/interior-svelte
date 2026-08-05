<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type BlurUpStatus = 'loading' | 'ready' | 'error';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		src?: string;
		alt: string;
		width: number;
		height: number;
		placeholder?: string;
		color?: string;
		blur?: number;
		radius?: 5 | 6 | 9 | 11 | 14;
		srcSet?: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		fetchPriority?: 'high' | 'low' | 'auto';
		onReady?: () => void;
		onError?: () => void;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const DEVELOP = { duration: 0.65, ease: [0.23, 1, 0.32, 1] } as const;
	const INSTANT = { duration: 0 } as const;

	let {
		src,
		alt,
		width,
		height,
		placeholder,
		color,
		blur = 14,
		radius = 11,
		srcSet,
		sizes,
		loading = 'lazy',
		fetchPriority,
		onReady,
		onError,
		class: className,
		...rest
	}: Props = $props();

	let image: HTMLImageElement | null = null;
	let status = $state<BlurUpStatus>('loading');
	let instant = $state(false);

	$effect(() => {
		// Track srcSet changes as well as src so responsive-source swaps reset state.
		void srcSet;
		const img = image;
		if (!img || !src) {
			status = 'loading';
			instant = false;
			return;
		}

		let alive = true;
		const cached = img.complete && img.naturalWidth > 0;
		const set = (next: BlurUpStatus, nextInstant: boolean) => {
			if (!alive) return;
			status = next;
			instant = nextInstant;
		};
		const ready = () => {
			if (!alive) return;
			set('ready', cached);
			onReady?.();
		};
		const failed = () => {
			if (!alive) return;
			set('error', cached);
			onError?.();
		};

		if (img.complete) {
			if (cached) ready();
			else failed();
			return () => { alive = false; };
		}

		set('loading', false);
		const load = () => {
			if (typeof img.decode === 'function') img.decode().then(ready, failed);
			else ready();
		};
		img.addEventListener('load', load);
		img.addEventListener('error', failed);
		return () => {
			alive = false;
			img.removeEventListener('load', load);
			img.removeEventListener('error', failed);
		};
	});

	const shown = $derived(status === 'ready');
	const still = $derived(reducedMotion.current || instant);
	const transition = $derived(still ? INSTANT : DEVELOP);
</script>

<div
	{...rest}
	aria-busy={status === 'loading'}
	style={`aspect-ratio:${width} / ${height};border-radius:${radius}px;background-color:${color ?? ''}`}
	class={cn('relative w-full overflow-hidden bg-stone-200 dark:bg-white/15', className)}
>
	{#if placeholder}
		<img src={placeholder} alt="" aria-hidden draggable="false" class="absolute inset-0 h-full w-full object-cover" style={`filter:blur(${blur}px);transform:scale(1.08)`} />
	{/if}
	<motion.img
		bind:this={image}
		src={src}
		srcset={srcSet}
		sizes={sizes}
		alt={alt}
		width={width}
		height={height}
		loading={loading}
		fetchpriority={fetchPriority}
		decoding="async"
		draggable="false"
		class="absolute inset-0 h-full w-full object-cover"
		initial={false}
		animate={still ? { opacity: shown ? 1 : 0 } : shown ? { opacity: 1, filter: 'blur(0px) saturate(1)', scale: 1 } : { opacity: 0, filter: 'blur(18px) saturate(0.6)', scale: 1.06 }}
		transition={transition}
	/>
	{#if status === 'error'}
		<motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={transition} class="absolute inset-0 grid place-items-center bg-white text-stone-400 dark:bg-[#1D1D1A] dark:text-stone-500">
			<svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16h64a8,8,0,0,0,7.59-5.47l14.83-44.48L163,151.43a8.07,8.07,0,0,0,4.46-4.46l14.62-36.55,44.48-14.83A8,8,0,0,0,232,88V56A16,16,0,0,0,216,40ZM112.41,157.47,98.23,200H40V172l52-52,30.42,30.42L117,152.57A8,8,0,0,0,112.41,157.47ZM216,82.23,173.47,96.41a8,8,0,0,0-4.9,4.62l-14.72,36.82L138.58,144l-35.27-35.27a16,16,0,0,0-22.62,0L40,149.37V56H216Zm12.68,33a8,8,0,0,0-7.21-1.1l-23.8,7.94a8,8,0,0,0-4.9,4.61l-14.31,35.77-35.77,14.31a8,8,0,0,0-4.61,4.9l-7.94,23.8A8,8,0,0,0,137.73,216H216a16,16,0,0,0,16-16V121.73A8,8,0,0,0,228.68,115.24ZM216,200H148.83l3.25-9.75,35.51-14.2a8.07,8.07,0,0,0,4.46-4.46l14.2-35.51,9.75-3.25Z" /></svg>
		</motion.div>
	{/if}
</div>
