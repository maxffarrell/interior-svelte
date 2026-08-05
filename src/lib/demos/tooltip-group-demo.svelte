<script lang="ts">
	import TooltipGroup from '#lib/components/interior/tooltip-group.svelte';
	import Tooltip from '#lib/components/interior/tooltip.svelte';
	const tools = [
		{ id: 'bold', glyph: 'B', label: 'Bold', hint: '⌘B' },
		{ id: 'italic', glyph: 'I', label: 'Italic', hint: '⌘I' },
		{ id: 'under', glyph: 'U', label: 'Underline', hint: '⌘U' },
		{ id: 'code', glyph: '{}', label: 'Inline code', hint: '⌘E' },
		{ id: 'link', glyph: '↗', label: 'Insert link', hint: '⌘K' }
	];
</script>
<TooltipGroup class="flex items-center gap-1">
	{#each tools as tool (tool.id)}
		{#snippet label()}<span class="flex items-center gap-2">{tool.label}<span class="font-mono text-[9.5px] opacity-60">{tool.hint}</span></span>{/snippet}
		{#snippet child()}<button type="button" class="mat-cap press flex h-9 w-10 items-center justify-center rounded-[7px] font-mono text-[12.5px] text-ink-2 hover:text-ink">{tool.glyph}</button>{/snippet}
		<Tooltip side="top" {label} children={child} />
	{/each}
</TooltipGroup>
