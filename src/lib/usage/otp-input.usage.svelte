<script lang="ts">
	import OtpInput from '#lib/components/interior/otp-input.svelte';

	let { challengeId }: { challengeId: string } = $props();

	let phase = $state<'idle' | 'checking' | 'rejected'>('idle');

	async function submit(code: string) {
		phase = 'checking';

		const response = await fetch('/api/verify', {
			method: 'POST',
			body: JSON.stringify({ challengeId, code })
		});

		phase = response.ok ? 'idle' : 'rejected';
	}
</script>

<OtpInput
	length={6}
	autofocus
	disabled={phase === 'checking'}
	status={phase === 'rejected' ? 'error' : 'idle'}
	hint="Paste the whole code into any cell."
	errorMessage="That code is wrong. Fix the digit that slipped."
	onChange={() => {
		if (phase === 'rejected') phase = 'idle';
	}}
	onComplete={submit}
/>
