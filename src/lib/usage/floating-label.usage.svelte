<script lang="ts">
	import FloatingLabel from '#lib/components/interior/floating-label.svelte';

	let email = $state('');
	let reference = $state('');
	let touched = $state(false);

	const bad = $derived(touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
</script>

<form class="grid gap-4">
	<FloatingLabel
		label="Work email"
		type="email"
		autocomplete="email"
		required
		value={email}
		onChange={(next) => (email = next)}
		onBlur={() => (touched = true)}
		invalid={bad}
		hint={bad ? 'Needs to look like name@company.com' : 'Receipts are sent here.'}
	/>

	<FloatingLabel
		label="Invoice reference"
		value={reference}
		onChange={(next) => (reference = next)}
		maxlength={16}
		hint="Printed on the statement header."
	/>
</form>
