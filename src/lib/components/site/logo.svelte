<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLSpanElement> & {
		size?: number;
	};
</script>

<script lang="ts">
	import { cn } from '#lib/utils';

	let { size = 14, class: className, ...rest }: Props = $props();
</script>

<span
	{...rest}
	class={cn('inline-block tracking-[-0.02em] whitespace-nowrap', className)}
	style="font-size: {size}px"
>
	<span class="font-semibold text-ink">interior</span><span
		class="mx-[2.5px] font-semibold tracking-[0.04em] text-accent">[.]</span
	><span class="font-medium text-ink-3">svelte</span>
</span>
