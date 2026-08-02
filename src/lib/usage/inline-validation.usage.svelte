<script lang="ts">
	import InlineValidation from '#lib/components/interior/inline-validation.svelte';

	let { onInvite }: { onInvite: (email: string) => void } = $props();

	const checkEmail = (value: string) => {
		if (value.trim() === '') return 'A work email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
			return 'That is not a complete email address.';
		}
		return null;
	};

	let email = $state('');
</script>

<form
	class="w-full max-w-sm"
	onsubmit={(event) => {
		event.preventDefault();
		if (checkEmail(email)) return;
		onInvite(email);
	}}
>
	<InlineValidation
		label="Work email"
		type="email"
		autocomplete="email"
		value={email}
		onChange={(next) => (email = next)}
		validate={checkEmail}
		hint="Only used to send the invite."
		required
	/>

	<button
		type="submit"
		class="mat-cap mt-3 h-9 rounded-[9px] px-3 text-[13px] font-medium text-ink-2"
	>
		Send invite
	</button>
</form>
