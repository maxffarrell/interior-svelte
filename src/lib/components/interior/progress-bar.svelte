<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props = HTMLAttributes<HTMLDivElement> & { value?: number | null; label?: string };
</script>

<script lang="ts">
	let { value = null, label = 'Progress', class: className, ...rest }: Props = $props();
	let percent = $derived(value == null ? null : Math.max(0, Math.min(100, value)));
</script>

<div {...rest} class="grid gap-2 {className ?? ''}">
	<div class="flex items-center justify-between text-[11px] text-ink-3">
		<span>{label}</span><span class="tnum font-mono"
			>{percent == null ? 'Working' : `${percent}%`}</span
		>
	</div>
	<div class="mat-well relative h-2 overflow-hidden rounded-full">
		<div
			class="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-500"
			style:width={percent == null ? '38%' : `${percent}%`}
			data-indeterminate={percent == null}
		></div>
	</div>
</div>

<style>
	[data-indeterminate='true'] {
		animation: drift 1.4s ease-in-out infinite alternate;
	}
	@keyframes drift {
		from {
			transform: translateX(-18%);
			width: 32%;
		}
		to {
			transform: translateX(180%);
			width: 38%;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		[data-indeterminate='true'] {
			animation: none;
		}
	}
</style>
