<script lang="ts">
	import StickyHeader from '#lib/components/interior/sticky-header.svelte';
	const messages = [{ from: 'Nadia Okonkwo', line: 'Re: pricing page copy' }, { from: 'Build bot', line: 'main passed in 3m 12s' }, { from: 'Sam Ferreira', line: 'Invoice for October' }, { from: 'Design weekly', line: 'Notes from Thursday' }, { from: 'Priya Raman', line: 'Contract redlines attached' }, { from: 'Status', line: 'Region eu-west-1 recovered' }, { from: 'Tom Vale', line: 'Can we move standup?' }, { from: 'Ines Cardoso', line: 'Two questions about the audit' }];
</script>

<div class="mx-auto w-full max-w-[440px]"><StickyHeader title="Inbox" subtitle={`${messages.length} messages`}>
	{#snippet children()}<ul class="px-2 pb-2">{#each messages as message}<li class="min-w-0 px-2 py-2"><span class="block truncate text-[13px] font-medium text-ink">{message.from}</span><span class="block truncate text-[11.5px] text-ink-3">{message.line}</span></li>{/each}</ul>{/snippet}
</StickyHeader></div>
