<script lang="ts">
	import HideOnScroll from '#lib/components/interior/hide-on-scroll.svelte';
	let saved = $state(false);
	const article = ['A ship at sea can read its latitude off the sun. Longitude is a question about time: how far local noon has drifted from noon at a port whose position is already known.', 'The pendulum clocks of the seventeenth century kept excellent time on land and none at all on a deck that pitched, rolled, and changed temperature twice a day.', 'John Harrison spent thirty-one years on it. The first three machines were large, ingenious, and impractical. The fourth was the size of a pocket watch.', 'H4 lost five seconds on the passage to Jamaica in 1761 — about a minute and a quarter of longitude, comfortably inside what the prize demanded.', 'The Board of Longitude paid him in instalments, over fourteen years, and never in full.'];
</script>

<div class="mx-auto w-full max-w-[440px]"><HideOnScroll maxHeight={268} label="Longitude">
	{#snippet bar()}<span class="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">Longitude</span><button type="button" aria-pressed={saved} aria-label={saved ? 'Remove bookmark' : 'Bookmark'} onclick={() => (saved = !saved)} class="mat-cap press flex size-7 items-center justify-center rounded-[6px] text-ink-2">☆</button>{/snippet}
	{#snippet children()}<div class="space-y-3 px-3.5 pb-4 pt-1">{#each article as paragraph}<p class="text-[13px] leading-relaxed text-ink-2">{paragraph}</p>{/each}</div>{/snippet}
</HideOnScroll></div>
