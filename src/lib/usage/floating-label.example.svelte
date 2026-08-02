<script lang="ts">
	import FloatingLabel from '#lib/components/interior/floating-label.svelte';

	let email = $state('');
	let reference = $state('');
	let touched = $state(false);
	let saved = $state(false);

	const bad = $derived(touched && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
	const ready = $derived(email.length > 0 && !bad);
</script>

<div class="flex w-full justify-center">
	<form
		class="mat-panel grid w-full max-w-80 gap-4 rounded-[14px] p-4"
		onsubmit={(event) => {
			event.preventDefault();
			saved = true;
		}}
	>
		<FloatingLabel
			label="Work email"
			type="email"
			autocomplete="email"
			required
			value={email}
			onChange={(next) => {
				email = next;
				saved = false;
			}}
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

		<div class="flex items-center gap-3">
			<button
				type="submit"
				disabled={!ready}
				class="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px] font-medium text-ink-2 disabled:opacity-40"
			>
				Save billing details
			</button>

			<span
				data-saved={saved || undefined}
				class="min-w-0 truncate text-[11.5px] text-ink-3 opacity-0 transition-opacity data-saved:opacity-100"
			>
				Saved to {email}.
			</span>
		</div>
	</form>
</div>
