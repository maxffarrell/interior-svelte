<script lang="ts">
	import WizardSteps from '#lib/components/interior/wizard-steps.svelte'; let index = $state(0); let complete = $state(false); const row = 'flex items-center justify-between rounded-[9px] bg-sub px-3 py-2 text-[12.5px]';
</script>
{#snippet plan()}<ul class="space-y-1"><li class={row}>Starter <span class="text-ink-3">3 seats</span></li><li class={row}>Team <span class="text-ink-3">12 seats</span></li></ul>{/snippet}
{#snippet billing()}<ul class="space-y-1"><li class={row}>Card <span class="text-ink-3">•••• 4242</span></li><li class={row}>Invoice email <span class="text-ink-3">billing@acme.co</span></li></ul>{/snippet}
{#snippet review()}<p>Everything is ready to review.</p>{/snippet}
<WizardSteps steps={[{ id: 'plan', label: 'Choose a plan', content: plan }, { id: 'billing', label: 'Billing details', content: billing }, { id: 'review', label: 'Review', content: review }]} bind:index complete={complete} onComplete={() => (complete = true)} />
