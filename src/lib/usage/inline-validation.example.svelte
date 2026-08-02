<script lang="ts">
	import InlineValidation from '#lib/components/interior/inline-validation.svelte';

	const TAKEN = ['acme', 'studio', 'interior'];

	const checkEmail = (value: string) => {
		if (value.trim() === '') return 'A work email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) return 'That is not a complete email address.';
		return null;
	};

	const checkHandle = (value: string) => {
		if (value.trim() === '') return 'Pick a handle - it becomes the workspace URL.';
		if (!/^[a-z0-9-]+$/u.test(value)) return 'Lowercase letters, numbers and dashes only.';
		if (value.length < 3) return 'Three characters at the very least.';
		if (TAKEN.includes(value)) return `interior.dev/${value} is already somebody else's.`;
		return null;
	};

	let email = $state('');
	let handle = $state('');
	let queued = $state<string[]>([]);

	const ready = $derived(checkEmail(email) === null && checkHandle(handle) === null);
</script>

<div class="flex w-full justify-center">
	<form
		class="mat-panel grid w-full max-w-88 gap-4 rounded-[14px] p-4"
		onsubmit={(event) => {
			event.preventDefault();
			if (!ready) return;
			queued = [...queued, email];
		}}
	>
		<div class="grid gap-1">
			<h3 class="text-[13px] font-medium text-ink">Start a workspace</h3>
			<p class="text-[12.5px] text-ink-3">
				Both fields settle on blur, then keep themselves honest while you type.
			</p>
		</div>

		<div class="grid gap-3">
			<InlineValidation
				label="Work email"
				type="email"
				autocomplete="email"
				placeholder="you@work.com"
				value={email}
				onChange={(next) => (email = next)}
				validate={checkEmail}
				hint="The invite and every receipt go here."
				required
			/>

			<InlineValidation
				label="Workspace handle"
				placeholder="northbound"
				value={handle}
				onChange={(next) => (handle = next.toLowerCase())}
				validate={checkHandle}
				debounce={250}
				reserveLines={2}
				hint="interior.dev/{handle || 'your-handle'} - acme, studio and interior are taken."
				required
			/>
		</div>

		<div class="flex items-center gap-3">
			<button
				type="submit"
				disabled={!ready}
				class="mat-cap press h-9 shrink-0 rounded-[9px] px-3.5 text-[13px] font-medium text-ink-2 disabled:opacity-40"
			>
				Create workspace
			</button>

			{#if queued.length > 0}
				<p class="min-w-0 truncate text-[11.5px] text-ink-3">
					{queued.length === 1 ? 'Invite sent to' : `${queued.length} invites, latest to`}
					{queued[queued.length - 1]}.
				</p>
			{/if}
		</div>
	</form>
</div>
