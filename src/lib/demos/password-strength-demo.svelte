<script lang="ts">
	import PasswordStrength from '#lib/components/interior/password-strength.svelte';

	const fieldId = $props.id();

	let value = $state('');
</script>

<div class="flex w-full justify-center">
	<div class="w-full max-w-80">
		<label for={fieldId} class="block text-[13px]/5 font-medium text-ink-2">New password</label>

		<input
			id={fieldId}
			type="password"
			autocomplete="new-password"
			spellcheck="false"
			placeholder="Type a password"
			bind:value
			class="mat-well mt-1.5 h-10 w-full rounded-[10px] border-2 border-hairline px-3 text-[13px]/5 text-ink-2 transition-[border-color] duration-150 outline-none placeholder:text-ink-3 focus:border-accent"
		/>

		<PasswordStrength {value} class="mt-3" />
	</div>
</div>
