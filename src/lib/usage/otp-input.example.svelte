<script lang="ts">
	import OtpInput, { type OtpStatus } from '#lib/components/interior/otp-input.svelte';

	const CODE = '204815';
	const CHECK = 620;
	const SETTLE = 1600;
	const RESEND = 20;

	const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

	let field = $state<OtpInput>();
	let status = $state<OtpStatus>('idle');
	let pending = $state('');
	let left = $state(RESEND);

	const checking = $derived(pending !== '');

	// The round trip a real route would spend in `fetch` - see the usage file for that half.
	$effect(() => {
		if (!checking) return;

		const code = pending;
		const verify = setTimeout(() => {
			status = code === CODE ? 'success' : 'error';
			pending = '';
		}, CHECK);

		return () => clearTimeout(verify);
	});

	$effect(() => {
		if (status !== 'error') return;

		const back = setTimeout(() => {
			field?.clear();
			status = 'idle';
		}, SETTLE);

		return () => clearTimeout(back);
	});

	$effect(() => {
		if (left === 0) return;

		const tick = setTimeout(() => left--, 1000);
		return () => clearTimeout(tick);
	});
</script>

<div class="flex w-full justify-center">
	<section class="mat-panel grid w-81 max-w-full gap-4 rounded-[14px] p-4">
		<div class="grid gap-1">
			<div class="flex items-baseline justify-between gap-3">
				<h3 class="text-[13px] font-medium text-ink">Confirm the transfer</h3>
				<p class="tnum shrink-0 text-[12.5px] text-ink-2">{money.format(240)}</p>
			</div>

			<p class="text-[12.5px] text-ink-3">To Northbound Studio.</p>
		</div>

		<OtpInput
			bind:this={field}
			length={6}
			groupEvery={3}
			{status}
			disabled={checking}
			hint="Sent to +49 ··· 0198 - try {CODE}."
			errorMessage="Wrong code. It clears itself in a moment."
			successMessage="Confirmed - the transfer is on its way."
			onChange={() => {
				if (status === 'error') status = 'idle';
			}}
			onComplete={(value) => (pending = value)}
		/>

		<div class="flex items-center gap-2.5 text-[11.5px] text-ink-3">
			<span>Nothing arrived?</span>

			<button
				type="button"
				disabled={left > 0 || checking}
				onclick={() => {
					field?.clear();
					status = 'idle';
					left = RESEND;
				}}
				class="mat-cap press h-6.5 rounded-[7px] px-2.5 text-[11.5px] font-medium text-ink-2 disabled:opacity-40"
			>
				Send it again
			</button>

			{#if left > 0}
				<span class="tnum">in {left}s</span>
			{/if}
		</div>
	</section>
</div>
