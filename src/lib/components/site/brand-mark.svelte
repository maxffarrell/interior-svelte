<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
	import { cn } from '#lib/utils';

	let { class: className, ...rest }: Props = $props();

	// prettier-ignore
	const GLYPH = [
		'..........',
		'..........',
		'..........',
		'..........',
		'...#..#...',
		'..........',
		'..........',
		'..........'
	];

	const ROWS = GLYPH.length;
	const COLS = GLYPH[0].length;

	const cells = Array.from({ length: COLS * ROWS }, (_, i) => ({
		i,
		lit: GLYPH[i % ROWS][Math.floor(i / ROWS)] === '#'
	}));
</script>

<div
	aria-hidden="true"
	{...rest}
	class={cn('grid w-fit grid-flow-col gap-0.5', className)}
	style="grid-template-rows: repeat({ROWS}, 5px)"
>
	{#each cells as cell (cell.i)}
		<span
			data-lit={cell.lit || undefined}
			class="block size-1.25 rounded-[1.5px] bg-ink/11 data-lit:bg-accent"
		></span>
	{/each}
</div>
