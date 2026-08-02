<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type Props = {
		children: Snippet;
		label?: string;
		bleed?: boolean;
	};
</script>

<script lang="ts">
	import ArrowClockwise from 'phosphor-svelte/lib/ArrowClockwiseIcon';
	import { cn } from '#lib/utils';

	let { children, label = 'preview', bleed = false }: Props = $props();

	let take = $state(0);
</script>

<div class="mat-panel rounded-2xl p-1.25">
	<div
		class={cn(
			'mat-well rounded-[11px]',
			bleed ? 'relative h-85 overflow-hidden' : 'grid min-h-66 place-items-center px-6 py-14'
		)}
	>
		{#key take}
			<div class={bleed ? 'h-full' : 'w-full min-w-0'}>
				{@render children()}
			</div>
		{/key}
	</div>

	<div class="flex h-9 items-center justify-between px-2.5">
		<span class="meta text-ink-3">{label}</span>
		<button
			type="button"
			onclick={() => take++}
			class="mat-cap press inline-flex h-5.5 items-center gap-1.5 rounded-md pr-2 pl-1.5 text-[10.5px] font-medium text-ink-2 hover:text-ink"
		>
			<ArrowClockwise
				size={11}
				weight="bold"
				aria-hidden="true"
				class="transition-transform duration-420 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
				style="rotate: {take * 360}deg"
			/>
			replay
		</button>
	</div>
</div>
