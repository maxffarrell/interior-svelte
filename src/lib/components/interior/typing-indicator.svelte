<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLDivElement> & { label?: string };
</script>

<script lang="ts">
	let { label = 'Someone is typing', class: className, ...rest }: Props = $props();
</script>

<div
	{...rest}
	role="status"
	aria-label={label}
	class="inline-flex items-center gap-2 text-[13px] text-ink-2 {className ?? ''}"
>
	<span class="mat-well inline-flex h-8 items-center gap-1 rounded-[10px] px-3">
		{#each [0, 1, 2] as delay}
			<i style:animation-delay={`${delay * 120}ms`}></i>
		{/each}
	</span>
	<span class="sr-only">{label}</span>
</div>

<style>
	i {
		display: block;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.35;
		animation: pulse 900ms ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.35;
		}
		50% {
			transform: translateY(-3px);
			opacity: 0.9;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		i {
			animation: none;
		}
	}
</style>
