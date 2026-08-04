<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLSpanElement> & {
		text: string;
		by?: 'word' | 'character';
		stagger?: number;
	};
</script>

<script lang="ts">
	let { text, by = 'word', stagger = 45, class: className, ...rest }: Props = $props();
	let units = $derived(by === 'character' ? Array.from(text) : text.split(' '));
</script>

<span {...rest} class={className ?? ''}>
	{#each units as unit, index (index)}<span
			class="reveal-unit"
			style:animation-delay={`${index * stagger}ms`}
			>{unit}{by === 'word' && index < units.length - 1 ? ' ' : ''}</span
		>{/each}
</span>

<style>
	.reveal-unit {
		display: inline-block;
		animation: reveal 600ms cubic-bezier(0.23, 1, 0.32, 1) both;
	}
	@keyframes reveal {
		from {
			opacity: 0;
			transform: translateY(10px);
			filter: blur(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal-unit {
			animation: none;
		}
	}
</style>
