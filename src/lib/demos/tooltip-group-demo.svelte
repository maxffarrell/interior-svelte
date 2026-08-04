<script lang="ts">
	import TooltipGroup from '#lib/components/interior/tooltip-group.svelte';
	import Tooltip from '#lib/components/interior/tooltip.svelte';
	const tools = ['B', 'I', 'U', '{}', '↗'];
</script>
<TooltipGroup class="flex items-center gap-1">
	{#each tools as glyph (glyph)}
		{#snippet label()}{glyph === '{}' ? 'Inline code' : `Tool ${glyph}`}{/snippet}
		{#snippet child()}<button type="button" class="mat-cap press flex h-9 w-10 items-center justify-center rounded-[7px] font-mono text-[12.5px]">{glyph}</button>{/snippet}
		<Tooltip side="top" {label} children={child} />
	{/each}
</TooltipGroup>
