<script lang="ts">
	import SwipeDeck from '#lib/components/interior/swipe-deck.svelte';
	type Lead = { id: string; name: string; role: string; note: string };
	const queue: Lead[] = [{ id: 'a', name: 'Nadia Roussel', role: 'Design engineer', note: 'Shipped a design system for a 40-person team.' }, { id: 'b', name: 'Tobias Lund', role: 'Design engineer', note: 'Six years of motion work, no production React.' }, { id: 'c', name: 'Priya Menon', role: 'Frontend', note: 'Rewrote checkout; 12 percent fewer drop-offs.' }, { id: 'd', name: 'Elias Kern', role: 'Frontend', note: 'Portfolio is three unfinished dashboards.' }];
</script>

<div class="grid w-full place-items-center"><div class="w-full max-w-90"><SwipeDeck items={queue} itemKey={(item) => item.id} itemLabel={(item) => `${item.name}, ${item.role}`} label="Applicant queue" leftLabel="Pass" rightLabel="Shortlist" emptyLabel="Queue cleared" height={152}>
	{#snippet children(item)}<div class="flex h-full flex-col justify-end gap-1 p-3.5"><p class="text-[13px] font-medium text-ink">{item.name}</p><p class="text-[12px] leading-relaxed text-ink-2">{item.note}</p><p class="text-[11.5px] text-ink-3">{item.role}</p></div>{/snippet}
</SwipeDeck></div></div>
