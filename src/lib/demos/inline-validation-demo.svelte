<script lang="ts">
	import InlineValidation from '#lib/components/interior/inline-validation.svelte';

	const checkEmail = (value: string) => {
		if (value.trim() === '') return 'A work email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
			return 'That is not a complete email address.';
		}
		return null;
	};

	let email = $state('');
</script>

<div class="flex w-full justify-center">
	<div class="w-full max-w-75">
		<InlineValidation
			label="Work email"
			type="email"
			placeholder="you@work.com"
			value={email}
			onChange={(next) => (email = next)}
			validate={checkEmail}
			hint="Only used to send the invite."
		/>
	</div>
</div>
