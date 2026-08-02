<script lang="ts">
	import LikeBurst from '#lib/components/interior/like-burst.svelte';

	const plural = new Intl.PluralRules('en-US');

	const count = (value: number, one: string, other: string) =>
		`${value} ${plural.select(value) === 'one' ? one : other}`;

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	let taps = $state(0);
	let writes = $state(0);
	let inflight = $state(0);
</script>

<div class="flex w-full justify-center">
	<article class="mat-panel w-full max-w-84 rounded-[14px] p-3.5">
		<h3 class="text-[13px] font-medium text-ink">Reserving the space is the whole job</h3>
		<p class="mt-1 text-[12.5px] text-ink-3">
			Why the count cell measures both reachable widths before the first paint.
		</p>

		<div class="mt-3 flex items-center justify-between gap-3">
			<LikeBurst
				initialCount={128}
				settle={400}
				onToggle={() => taps++}
				onCommit={async () => {
					inflight++;
					await wait(700);
					inflight--;
					writes++;
				}}
				onError={() => console.warn('Could not save your like')}
			/>

			<span class="meta text-right text-ink-3">
				{inflight > 0
					? 'saving…'
					: `${count(taps, 'tap', 'taps')} · ${count(writes, 'write', 'writes')}`}
			</span>
		</div>
	</article>
</div>
