<script lang="ts">
	import { motion } from 'motion-sv';
	import HoldToConfirm from '#lib/components/interior/hold-to-confirm.svelte';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const GROW = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;

	const NOTE = 28;

	let deleted = $state(false);
	let abandoned = $state(0);

	const grow = $derived(reducedMotion.current ? INSTANT : GROW);
</script>

<div class="flex w-full justify-center">
	<section class="mat-panel w-full max-w-80 rounded-[14px] p-4">
		<h3 class="text-[13px] font-medium text-ink">Delete this workspace</h3>
		<p class="mt-1 mb-3 text-[12.5px] text-ink-3">
			Members, files and history go with it. There is no undo.
		</p>

		<HoldToConfirm
			label="Delete workspace"
			confirmLabel="Workspace deleted"
			duration={1400}
			disabled={deleted}
			onAbort={() => abandoned++}
			onConfirm={() => (deleted = true)}
		/>

		<motion.div
			initial={false}
			animate={{ height: deleted || abandoned > 0 ? NOTE : 0 }}
			transition={grow}
			class="overflow-hidden"
		>
			<p class="pt-3 text-[11.5px]/4 text-ink-3">
				{#if deleted}
					Gone, and there is no undo — except
					<button
						type="button"
						onclick={() => {
							deleted = false;
							abandoned = 0;
						}}
						class="text-accent underline underline-offset-2"
					>
						put it back
					</button>.
				{:else}
					Released early {abandoned}× — nothing was destroyed.
				{/if}
			</p>
		</motion.div>
	</section>
</div>
