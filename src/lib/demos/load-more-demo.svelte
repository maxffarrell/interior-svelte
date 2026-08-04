<script lang="ts">
	import LoadMore from '#lib/components/interior/load-more.svelte';
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	const TOTAL = 40;
	const PAGE = 8;
	const EASE = [0.23, 1, 0.32, 1] as const;
	let count = $state(PAGE);
	let loaded = PAGE;
	let scroller: HTMLDivElement | null = null;
	let timers = new Set<ReturnType<typeof setTimeout>>();
	$effect(() => () => timers.forEach(clearTimeout));
	function load() {
		return new Promise<boolean>((resolve) => {
			const next = Math.min(TOTAL, loaded + PAGE);
			const timer = setTimeout(() => {
				timers.delete(timer);
				loaded = next;
				count = next;
				resolve(next < TOTAL);
			}, 700);
			timers.add(timer);
		});
	}
</script>

<div bind:this={scroller} class="h-full w-full overflow-y-auto overscroll-contain p-3">
	<ul class="space-y-1">
		{#each Array.from({ length: count }) as _, index (index)}
			<motion.li
				initial={index < PAGE ? false : { opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={reducedMotion.current ? { duration: 0 } : { duration: 0.26, ease: EASE, delay: (index % PAGE) * 0.03 }}
				class="rounded-[9px] border border-hairline bg-panel px-3 py-2.5 text-[12.5px] text-ink"
			>
				Item {String(index + 1).padStart(2, '0')}
			</motion.li>
		{/each}
	</ul>
	<div class="pt-3"><LoadMore onLoad={load} hasMore={count < TOTAL} root={scroller} rootMargin="120px 0px" maxAutoLoads={2} /></div>
</div>
