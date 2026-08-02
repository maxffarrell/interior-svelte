<script lang="ts">
	import Ripple from '#lib/components/interior/ripple.svelte';
	import { RippleState } from '#lib/components/interior/ripple.state.svelte';

	let { onDigit, onPlay }: { onDigit: (digit: string) => void; onPlay: () => void } = $props();

	const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

	const row = new RippleState({ max: 2 });
</script>

<div class="grid grid-cols-3 gap-2">
	{#each DIGITS as digit (digit)}
		<Ripple class="h-12 w-full font-mono" onPress={() => onDigit(digit)}>{digit}</Ripple>
	{/each}
</div>

<div
	role="button"
	tabindex="0"
	onclick={onPlay}
	onkeydown={(event) => {
		if (event.key === 'Enter' || event.key === ' ') onPlay();
	}}
	{@attach row.attach}
	class="relative isolate flex h-14 items-center rounded-[11px] px-3 text-[13px] text-ink-2"
>
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
	>
		{#each row.ripples as r (r.id)}
			<span
				class="absolute block size-10 rounded-[14px] bg-ink/10"
				style="left: {r.x - 20}px; top: {r.y -
					20}px; transform: scale({r.scale}); opacity: {r.released
					? 0
					: 1}; transition: opacity {row.fadeDuration}s linear"
			></span>
		{/each}
	</span>

	<span class="relative">Ambient Loop 04</span>
</div>
