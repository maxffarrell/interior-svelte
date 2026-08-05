<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLSpanElement> & {
		text: string;
		by?: 'word' | 'character';
		stagger?: number;
		startOnView?: boolean;
		play?: boolean;
		once?: boolean;
		amount?: number;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	let { text, by = 'word', stagger = 45, startOnView = true, play = true, once = true, amount = 0.35, class: className, ...rest }: Props = $props();
	let units = $derived(by === 'character' ? Array.from(text) : text.split(' '));
	let started = $state(!startOnView);
	let root: HTMLSpanElement | null = null;
	onMount(() => {
		if (!startOnView) { started = true; return; }
		if (!('IntersectionObserver' in window)) { started = true; return; }
		const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { started = true; if (once) observer.disconnect(); } else if (!once) started = false; }, { threshold: amount });
		if (root) observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<span bind:this={root} {...rest} class={className ?? ''}>
	<span class="sr-only">{text}</span>
	{#each units as unit, index (index)}<span
			class="reveal-unit"
			class:reveal-active={started && play}
			style:animation-delay={`${index * stagger}ms`}
			>{unit}{by === 'word' && index < units.length - 1 ? ' ' : ''}</span
		>{/each}
</span>

<style>
	.reveal-unit {
		display: inline-block;
		opacity: 0;
	}
	.reveal-unit.reveal-active {
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
		.reveal-unit.reveal-active {
			opacity: 1;
			animation: none;
		}
	}
</style>
