<script lang="ts" module>
	export type Props = {
		html: string;
	};
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import CaretDown from 'phosphor-svelte/lib/CaretDownIcon';

	let { html }: Props = $props();

	const COLLAPSED = 288;
	const EXPANDED_MAX = 620;

	let full = $state(0);
	let expanded = $state(false);

	const measure: Attachment<HTMLDivElement> = (node) => {
		const read = () => (full = node.scrollHeight);
		read();
		const observer = new ResizeObserver(read);
		observer.observe(node);
		return () => observer.disconnect();
	};

	const overflows = $derived(full > COLLAPSED + 40);
	const open = $derived(expanded || !overflows);
	const height = $derived(full === 0 ? undefined : open ? Math.min(full, EXPANDED_MAX) : COLLAPSED);
	const scrolls = $derived(open && full > EXPANDED_MAX);
	const lines = $derived(html.split('class="line"').length - 1);
</script>

<div class="relative scroll-mt-24">
	<div
		data-scrolls={scrolls || undefined}
		class="mat-well overflow-hidden rounded-[10px] transition-[height] duration-420 ease-[cubic-bezier(0.23,1,0.32,1)] data-scrolls:overflow-y-auto motion-reduce:transition-none"
		style:height={height ? `${height}px` : undefined}
	>
		<div {@attach measure} class="py-3.5 font-mono text-[12.5px] leading-[1.65]">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html html}
		</div>
	</div>

	{#if overflows}
		<div
			aria-hidden="true"
			data-expanded={expanded || undefined}
			class="pointer-events-none absolute inset-x-0 bottom-0 h-26 rounded-b-[10px] bg-linear-to-b from-transparent to-well to-78% transition-opacity duration-300 data-expanded:opacity-0 motion-reduce:transition-none"
		></div>

		<div
			data-expanded={expanded || undefined}
			class="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-transform duration-420 ease-[cubic-bezier(0.23,1,0.32,1)] data-expanded:translate-y-6 motion-reduce:transition-none"
		>
			<button
				type="button"
				onclick={() => (expanded = !expanded)}
				aria-expanded={expanded}
				data-expanded={expanded || undefined}
				class="mat-cap press group pointer-events-auto inline-flex h-6.5 items-center gap-1.5 rounded-[7px] pr-2 pl-2.5 text-[11.5px] font-medium text-ink-2 hover:text-ink"
			>
				{expanded ? 'Collapse' : `Show all ${lines} lines`}
				<CaretDown
					size={10}
					weight="bold"
					aria-hidden="true"
					class="transition-transform duration-240 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-expanded:rotate-180 motion-reduce:transition-none"
				/>
			</button>
		</div>
	{/if}
</div>
