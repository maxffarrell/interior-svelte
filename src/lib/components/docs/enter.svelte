<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement> & {
		delay?: number;
		children: Snippet;
	};
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	let { delay = 0, class: className, children, ...rest }: Props = $props();

	const arrive = $derived.by(() => {
		if (reducedMotion.current) return { duration: 0 };
		return { y: 8, duration: 420, delay: delay * 1000, easing: quintOut };
	});
</script>

<div {...rest} in:fly={arrive} class={cn(className)}>
	{@render children()}
</div>
