<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		typists?: string[];
		sending?: boolean;
		max?: number;
		size?: number;
		showLabel?: boolean;
		label?: string;
	};
</script>

<script lang="ts">
	import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	let { typists = ['Someone'], sending = false, max = 2, size = 34, showLabel = true, label, class: className, ...rest }: Props = $props();
	let active = $derived(typists.length > 0 && !sending);
	let visible = $derived(typists.slice(0, Math.max(1, max)));
	let labelText = $derived(label ?? (visible.length === 0 ? '' : visible.length === 1 ? `${visible[0]} is typing` : `${visible.join(', ')} are typing`));
	const wave = useMotionValue(0);
	$effect(() => {
		if (!active || reducedMotion.current) { wave.set(0); return; }
		const controls = animate(wave, 3, { duration: 1.25, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
		return () => controls.stop();
	});
	function dotStyle(index: number) {
		const lift = useTransform(wave, (w) => { let d = (w - index) % 3; if (d < 0) d += 3; if (d > 1.5) d -= 3; return Math.max(0, 1 - Math.abs(d)); });
		return { scale: useTransform(lift, [0, 1], [0.74, 1]), opacity: useTransform(lift, [0, 1], [0.32, 1]) };
	}
	const dot = Math.round(size * 0.23);
</script>

<div {...rest} class="inline-flex max-w-full items-end gap-3 {className ?? ''}" style:height={`${size}px`}>
	<div class="relative shrink-0" style:width={`${Math.round(size * 2)}px`} style:height={`${size}px`}>
		<AnimatePresence initial={false}>{#if active}<motion.div aria-hidden="true" class="absolute inset-0 flex items-center justify-center gap-[5px] rounded-[16px] bg-stone-200 dark:bg-white/[0.09]" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.74 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.4 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}>
			{#each [0, 1, 2] as index}{#if reducedMotion.current}<span class="block rounded-full bg-stone-500 dark:bg-stone-300" style:width={`${dot}px`} style:height={`${dot}px`}></span>{:else}{@const styles = dotStyle(index)}<motion.span class="block rounded-full bg-stone-500 dark:bg-stone-300" style={{ width: `${dot}px`, height: `${dot}px`, ...styles }}></motion.span>{/if}{/each}
		</motion.div>{/if}</AnimatePresence>
	</div>
	{#if showLabel}<span class="grid min-w-0 flex-1" style:height={`${size * 0.6}px`}><AnimatePresence initial={false}>{#if labelText && !sending}<motion.span aria-hidden="true" class="col-start-1 row-start-1 self-center truncate text-[13px] text-stone-500 dark:text-stone-400" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, y: -7 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 }}>{labelText}</motion.span>{/if}</AnimatePresence></span>{/if}
	<span role="status" aria-live="polite" class="sr-only">{labelText}</span>
</div>
