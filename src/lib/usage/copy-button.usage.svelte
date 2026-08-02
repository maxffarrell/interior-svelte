<script lang="ts">
	import CopyButton from '#lib/components/interior/copy-button.svelte';

	let { token }: { token: string } = $props();
	let copies = $state(0);
</script>

<div class="flex items-center gap-3">
	<code class="mat-well rounded-[7px] px-2 py-1 font-mono text-[12px]">{token}</code>
	<CopyButton
		value={token}
		label="Copy token"
		copiedLabel="Copied"
		onCopy={() => copies++}
		onError={(reason) => console.error('clipboard refused', reason)}
	/>
	{#if copies > 0}
		<span class="text-[12px] text-ink-3">copied {copies}×</span>
	{/if}
</div>
