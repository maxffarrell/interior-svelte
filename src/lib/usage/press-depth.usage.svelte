<script lang="ts">
	import PressDepth from '#lib/components/interior/press-depth.svelte';
	import { PressDepthState } from '#lib/components/interior/press-depth.state.svelte';

	let { onSubmit }: { onSubmit: (cents: number) => void } = $props();

	let digits = $state('');

	const charge = new PressDepthState();
</script>

<div class="grid gap-3">
	<p class="tnum text-[13px] text-ink-2">
		${(Number(digits || '0') / 100).toFixed(2)}
	</p>

	<div class="flex gap-2">
		{#each ['1', '2', '3'] as digit (digit)}
			<PressDepth
				depth={2}
				aria-label="Digit {digit}"
				onclick={() => (digits = (digits + digit).slice(0, 6))}
			>
				{digit}
			</PressDepth>
		{/each}
	</div>

	<button
		{...charge.props}
		type="button"
		disabled={digits.length === 0}
		onclick={() => onSubmit(Number(digits))}
		style="transform: translateY({charge.pressed ? 2 : 0}px)"
		class="h-9 justify-self-start rounded-[9px] bg-ink px-3.5 text-[13px] font-medium text-panel disabled:opacity-50"
	>
		Charge
	</button>
</div>
