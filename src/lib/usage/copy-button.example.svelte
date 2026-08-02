<script lang="ts">
	import { motion } from 'motion-sv';
	import CopyButton from '#lib/components/interior/copy-button.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const GROW = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	const NOTE = 26;

	const TOKEN = 'interior_sk_9f2c41ab7d03';

	let copies = $state(0);

	const grow = $derived(reducedMotion.current ? INSTANT : GROW);
</script>

<div class="flex w-full justify-center">
	<div class="mat-panel grid w-full max-w-84 gap-2.5 rounded-[14px] p-3.5">
		<div class="flex items-center justify-between gap-3">
			<p class="text-[13px] font-medium text-ink">Deploy token</p>
			<span class="meta text-ink-3">
				{copies === 0 ? 'never copied' : `copied ${copies}×`}
			</span>
		</div>

		<div class="flex items-center gap-2">
			<code
				data-copied={copies > 0 || undefined}
				class="mat-well min-w-0 flex-1 truncate rounded-[10px] px-2.5 py-2 font-mono text-[12px] text-ink-2 ring-accent/40 transition-shadow data-copied:ring-2"
			>
				{TOKEN}
			</code>

			<CopyButton
				value={TOKEN}
				label="Copy token"
				copiedLabel="Copied"
				onCopy={() => copies++}
				onError={(reason) => console.error('clipboard refused', reason)}
			/>
		</div>

		<motion.div
			initial={false}
			animate={{ height: copies > 0 ? NOTE : 0 }}
			transition={grow}
			class="overflow-hidden"
		>
			<p class="pt-2.5 text-[11.5px]/4 text-ink-3">
				Paste it into your CI secrets. It is not shown again.
			</p>
		</motion.div>
	</div>
</div>
