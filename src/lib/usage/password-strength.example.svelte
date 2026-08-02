<script lang="ts">
	import PasswordStrength from '#lib/components/interior/password-strength.svelte';
	import {
		defaultPasswordRules,
		PasswordStrengthState
	} from '#lib/components/interior/password-strength.state.svelte';

	const ACCOUNT = 'ada@northbound.studio';

	const rules = [
		...defaultPasswordRules,
		{
			id: 'personal',
			label: 'Nothing from your email address',
			test: (value: string) => value.length > 0 && !value.toLowerCase().includes('ada')
		}
	];

	const fieldId = $props.id();

	let password = $state('');
	let revealed = $state(false);
	let created = $state(false);

	const strength = new PasswordStrengthState(() => ({ value: password, rules }));
	const ready = $derived(strength.score === strength.max);
</script>

<div class="flex w-full justify-center">
	<form
		class="mat-panel grid w-full max-w-84 gap-4 rounded-[14px] p-4"
		onsubmit={(event) => {
			event.preventDefault();
			created = true;
		}}
	>
		<div class="flex items-baseline justify-between gap-3">
			<h3 class="text-[13px] font-medium text-ink">Finish your account</h3>
			<p class="min-w-0 truncate text-[11.5px] text-ink-3">{ACCOUNT}</p>
		</div>

		<div class="grid gap-1.5">
			<div class="flex items-baseline justify-between gap-3">
				<label for={fieldId} class="text-[12.5px] font-medium text-ink-2">New password</label>

				<button
					type="button"
					onclick={() => (revealed = !revealed)}
					class="text-[11.5px] text-ink-3 hover:text-ink-2"
				>
					{revealed ? 'Hide' : 'Show'}
				</button>
			</div>

			<input
				id={fieldId}
				type={revealed ? 'text' : 'password'}
				autocomplete="new-password"
				spellcheck="false"
				placeholder="Type a password"
				bind:value={password}
				oninput={() => (created = false)}
				class="mat-well h-10 w-full rounded-[10px] border-2 border-hairline px-3 text-[13px]/5 text-ink-2 transition-[border-color] duration-150 outline-none placeholder:text-ink-3 focus:border-accent"
			/>
		</div>

		<PasswordStrength value={password} {rules} />

		<div class="flex items-center gap-3">
			<button
				type="submit"
				disabled={!ready}
				class="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink-2 disabled:opacity-40"
			>
				Create account
			</button>

			{#if created}
				<p class="min-w-0 truncate text-[11.5px] text-ink-3">
					All {strength.max} requirements met.
				</p>
			{/if}
		</div>
	</form>
</div>
