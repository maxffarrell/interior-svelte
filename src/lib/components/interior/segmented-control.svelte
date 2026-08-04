<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Segment = { value: string; label: string };
	export type Props = HTMLAttributes<HTMLDivElement> & {
		items?: Segment[];
		value?: string;
		onChange?: (value: string) => void;
	};
</script>

<script lang="ts">
	let {
		items = [
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' },
			{ value: 'year', label: 'Year' }
		],
		value = $bindable(items[0]?.value ?? ''),
		onChange,
		class: className,
		...rest
	}: Props = $props();
	function select(next: string) {
		value = next;
		onChange?.(next);
	}
</script>

<div {...rest} class="mat-well inline-flex rounded-[10px] p-1 {className ?? ''}">
	{#each items as item (item.value)}
		<button
			type="button"
			onclick={() => select(item.value)}
			class="relative rounded-[7px] px-3 py-1.5 text-[12px] text-ink-3 transition-colors data-[active=true]:text-ink"
			data-active={value === item.value}
		>
			{#if value === item.value}<span class="mat-cap absolute inset-0 -z-1 rounded-[7px]"
				></span>{/if}<span class="relative">{item.label}</span>
		</button>
	{/each}
</div>
