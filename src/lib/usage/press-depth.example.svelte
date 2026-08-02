<script lang="ts">
	import PressDepth from '#lib/components/interior/press-depth.svelte';
	import { PressDepthState } from '#lib/components/interior/press-depth.state.svelte';

	const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

	const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

	let digits = $state('');
	let charges = $state<number[]>([]);

	const amount = $derived(Number(digits || '0') / 100);
	const total = $derived(charges.reduce((sum, cents) => sum + cents, 0) / 100);

	const charge = new PressDepthState();
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel grid w-full max-w-76 gap-3 rounded-[14px] p-3.5">
		<div class="flex items-baseline justify-between gap-3">
			<p class="tnum text-[20px] font-medium tracking-[-0.03em] text-ink">
				{money.format(amount)}
			</p>
			<p class="meta text-ink-3">
				{charges.length === 0
					? 'no charges yet'
					: `${charges.length} taken · ${money.format(total)}`}
			</p>
		</div>

		<div class="grid grid-cols-5 gap-2">
			{#each KEYS as key (key)}
				<PressDepth
					depth={2}
					class="w-full font-mono"
					aria-label="Digit {key}"
					onclick={() => (digits = (digits + key).slice(0, 6))}
				>
					{key}
				</PressDepth>
			{/each}
		</div>

		<div class="flex items-center gap-2">
			<button
				{...charge.props}
				type="button"
				disabled={digits.length === 0}
				data-pressed={charge.pressed || undefined}
				onclick={() => {
					charges = [...charges, Number(digits)];
					digits = '';
				}}
				class="h-9 flex-1 rounded-[9px] bg-ink px-3.5 text-[13px] font-medium text-panel transition-transform disabled:opacity-40 data-pressed:translate-y-0.5"
			>
				Charge
			</button>

			<button
				type="button"
				disabled={digits.length === 0}
				onclick={() => (digits = '')}
				class="mat-cap press h-9 rounded-[9px] px-3 text-[12.5px] font-medium text-ink-2 disabled:opacity-40"
			>
				Clear
			</button>
		</div>
	</div>
</div>
