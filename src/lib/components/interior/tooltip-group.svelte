<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type Props = { children: Snippet; openDelay?: number; closeDelay?: number; skipDelay?: number; class?: string };
</script>
<script lang="ts">
	let { children, class: className = '' }: Props = $props();
</script>
<div class={className}>{@render children()}</div>
