<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';
	export type Props = Omit<HTMLButtonAttributes, 'children'> & {
		count?: number;
		onReveal?: () => void;
	};
</script>

<script lang="ts">
	let { count = 3, onReveal, class: className, ...rest }: Props = $props();
</script>

<button
	{...rest}
	type="button"
	onclick={onReveal}
	class="press mat-cap inline-flex h-8 items-center gap-2 rounded-full px-3 text-[12px] font-medium text-ink-2 {className ??
		''}"
>
	<span class="size-1.5 rounded-full bg-accent"></span>
	{count} new {count === 1 ? 'item' : 'items'}
	<span aria-hidden="true" class="text-ink-3">↓</span>
</button>
