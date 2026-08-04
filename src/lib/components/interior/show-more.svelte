<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLDivElement> & {
		title?: string;
		children?: import('svelte').Snippet;
	};
</script>

<script lang="ts">
	let { title = 'Show more', children, class: className, ...rest }: Props = $props();
	let expanded = $state(false);
</script>

<div {...rest} class="grid gap-3 {className ?? ''}">
	<div
		class="grid transition-[grid-template-rows] duration-300"
		style:grid-template-rows={expanded ? '1fr' : '0fr'}
	>
		<div class="min-h-0 overflow-hidden text-[13px] leading-relaxed text-ink-2">
			{@render children?.()}
		</div>
	</div>
	<button
		type="button"
		class="press mat-cap inline-flex h-8 w-fit items-center gap-2 rounded-[9px] px-3 text-[12px] font-medium text-ink-2"
		aria-expanded={expanded}
		onclick={() => (expanded = !expanded)}
		>{expanded ? 'Show less' : title}<span aria-hidden="true">{expanded ? '↑' : '↓'}</span></button
	>
</div>
