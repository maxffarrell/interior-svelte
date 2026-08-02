<script lang="ts">
	import { motion } from 'motion-sv';
	import IconMorph from '#lib/components/interior/icon-morph.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const GROW = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	const ROW = 36;

	const NOW_PLAYING = 'Ambient Loop 04';
	const QUEUE = ['Night Kitchen', 'Slow Transit'];

	let playing = $state<number | boolean>(false);
	let open = $state<number | boolean>(false);

	const grow = $derived(reducedMotion.current ? INSTANT : GROW);
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel w-full max-w-84 rounded-[14px] p-1.25">
		<div class="flex items-center gap-2 px-1.5 py-1">
			<IconMorph preset="play-pause" semantics="pressed" bind:active={playing} />

			<div class="min-w-0 flex-1">
				<p class="truncate text-[13px] font-medium text-ink">{NOW_PLAYING}</p>
				<p class="truncate text-[11.5px] text-ink-3">{playing ? 'Playing' : 'Paused'}</p>
			</div>

			<IconMorph preset="menu-close" semantics="expanded" bind:active={open} />
		</div>

		<motion.div
			initial={false}
			animate={{ height: open ? QUEUE.length * ROW : 0 }}
			transition={grow}
			class="overflow-hidden"
		>
			<ul>
				{#each QUEUE as track (track)}
					<li class="flex h-9 items-center rounded-[9px] px-2.5 text-[12.5px] text-ink-2">
						{track}
					</li>
				{/each}
			</ul>
		</motion.div>
	</div>
</div>
