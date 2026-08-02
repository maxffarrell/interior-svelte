<script lang="ts">
	import OtpInput, { type OtpStatus } from '#lib/components/interior/otp-input.svelte';

	const CODE = '204815';
	const SETTLE = 1600;

	let field = $state<OtpInput>();
	let status = $state<OtpStatus>('idle');

	$effect(() => {
		if (status === 'idle') return;

		const back = setTimeout(() => {
			field?.clear();
			status = 'idle';
		}, SETTLE);

		return () => clearTimeout(back);
	});
</script>

<div class="flex w-full justify-center">
	<OtpInput
		bind:this={field}
		{status}
		hint="Try {CODE}, or anything else."
		successMessage="Code accepted."
		errorMessage="That code is not right."
		onComplete={(value) => (status = value === CODE ? 'success' : 'error')}
	/>
</div>
