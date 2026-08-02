<script lang="ts">
	import Ripple from '#lib/components/interior/ripple.svelte';
	import { RippleState } from '#lib/components/interior/ripple.state.svelte';

	const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

	let entered = $state('');
	let playing = $state(false);

	const display = $derived(entered.padEnd(6, '·'));

	const row = new RippleState({ max: 2 });
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel grid w-full max-w-76 gap-3 rounded-[14px] p-3.5">
		<p class="tnum text-center font-mono text-[15px] tracking-[0.2em] text-ink">{display}</p>

		<div class="grid grid-cols-3 gap-2">
			{#each KEYS as key (key)}
				<Ripple class="h-12 w-full font-mono" onPress={() => (entered = (entered + key).slice(-6))}>
					{key}
				</Ripple>
			{/each}
		</div>

		<div
			role="button"
			tabindex="0"
			aria-pressed={playing}
			onclick={() => (playing = !playing)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') playing = !playing;
			}}
			{@attach row.attach}
			class="mat-well relative isolate flex h-13 items-center gap-3 rounded-[11px] px-3 text-[13px] text-ink-2"
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

			<span class="relative min-w-0 flex-1 truncate">Ambient Loop 04</span>
			<span class="relative shrink-0 text-[11.5px] text-ink-3">
				{playing ? 'Playing' : 'Paused'}
			</span>
		</div>
	</div>
</div>
