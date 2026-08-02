<script lang="ts">
	import PasswordStrength from '#lib/components/interior/password-strength.svelte';
	import { PasswordStrengthState } from '#lib/components/interior/password-strength.state.svelte';

	let { onCreate }: { onCreate: (password: string) => void } = $props();

	const fieldId = $props.id();

	let password = $state('');

	const strength = new PasswordStrengthState(() => ({ value: password }));
	const ready = $derived(strength.score === strength.max);
</script>

<form
	class="grid w-full max-w-sm gap-2"
	onsubmit={(event) => {
		event.preventDefault();
		onCreate(password);
	}}
>
	<label for={fieldId} class="text-[12.5px]/5 text-ink-3">New password</label>

	<input
		id={fieldId}
		type="password"
		autocomplete="new-password"
		bind:value={password}
		class="mat-well h-9 w-full rounded-[9px] border border-hairline px-3 text-[13px]/5 text-ink-2 outline-none focus:border-accent"
	/>

	<PasswordStrength value={password} class="mt-1" />

	<button
		type="submit"
		disabled={!ready}
		class="mat-cap mt-2 h-9 rounded-[9px] text-[13px]/5 font-medium text-ink-2 disabled:opacity-50"
	>
		Create account
	</button>
</form>
