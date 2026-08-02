<script lang="ts">
	import { motion } from 'motion-sv';
	import LoadingButton from '#lib/components/interior/loading-button.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const GROW = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
	const when = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

	const RECEIPT = 28;

	const AMOUNT = 1280;
	const DUE_IN_DAYS = 14;

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	let sent = $state(false);
	let attempts = $state(0);

	const grow = $derived(reducedMotion.current ? INSTANT : GROW);
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel w-full max-w-84 rounded-[14px] p-3.5">
		<div class="flex items-center gap-3">
			<div class="min-w-0 flex-1">
				<div class="flex items-center gap-2">
					<p class="truncate text-[13px] font-medium text-ink">Invoice INV-2043</p>
					<span
						data-sent={sent || undefined}
						class="mat-well rounded-[5px] px-1.5 py-0.5 text-[10px] text-ink-3 data-sent:text-accent"
					>
						{sent ? 'Sent' : 'Draft'}
					</span>
				</div>
				<p class="tnum mt-1 truncate text-[12.5px] text-ink-3">
					{money.format(AMOUNT)} · {sent
						? 'with billing@northwind.co'
						: `due ${when.format(DUE_IN_DAYS, 'day')}`}
				</p>
			</div>

			<LoadingButton
				label="Send invoice"
				pendingLabel="Sending"
				successLabel="Sent"
				errorLabel="Retry"
				onAction={async () => {
					await wait(900);
					attempts++;
					sent = true;
				}}
			/>
		</div>

		<motion.div
			initial={false}
			animate={{ height: attempts > 0 ? RECEIPT : 0 }}
			transition={grow}
			class="overflow-hidden"
		>
			<p class="pt-3 text-[11.5px]/4 text-ink-3">
				{attempts === 1 ? 'Delivered once. Sending again is safe.' : `Delivered ${attempts} times.`}
			</p>
		</motion.div>
	</div>
</div>
