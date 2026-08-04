<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Tab = { value: string; label: string };
	export type Props = HTMLAttributes<HTMLDivElement> & {
		items?: Tab[];
		value?: string;
		onChange?: (value: string) => void;
	};
</script>

<script lang="ts">
	let {
		items = [
			{ value: 'one', label: 'Overview' },
			{ value: 'two', label: 'Details' },
			{ value: 'three', label: 'Activity' }
		],
		value = $bindable(items[0]?.value ?? ''),
		onChange,
		class: className,
		...rest
	}: Props = $props();
	let active = $derived(items.find((item) => item.value === value)?.value ?? items[0]?.value ?? '');
	function select(next: string) {
		value = next;
		onChange?.(next);
	}
</script>

<div {...rest} class="grid gap-4 {className ?? ''}">
	<div role="tablist" class="mat-well relative flex rounded-[10px] p-1">
		{#each items as item (item.value)}
			<button
				type="button"
				role="tab"
				aria-selected={active === item.value}
				onclick={() => select(item.value)}
				class="relative z-1 flex-1 rounded-[7px] px-3 py-2 text-[12px] text-ink-3 transition-colors data-[active=true]:text-ink"
				data-active={active === item.value}
			>
				{#if active === item.value}<span class="mat-cap absolute inset-0 -z-1 rounded-[7px]"
					></span>{/if}
				<span class="relative">{item.label}</span>
			</button>
		{/each}
	</div>
	<div class="mat-panel rounded-[12px] p-4 text-[13px] leading-relaxed text-ink-2">
		{items.find((item) => item.value === active)?.label} content
	</div>
</div>
