<script lang="ts">
	import LoadingButton from '#lib/components/interior/loading-button.svelte';

	let { invoiceId }: { invoiceId: string } = $props();
</script>

<LoadingButton
	label="Send invoice"
	pendingLabel="Sending"
	successLabel="Sent"
	errorLabel="Retry"
	onAction={async () => {
		const response = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' });
		if (!response.ok) throw new Error(await response.text());
	}}
	onError={(error) => console.error(error)}
/>
