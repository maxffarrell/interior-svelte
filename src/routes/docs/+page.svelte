<script lang="ts">
	import { categories, readyEntries, SHIPPED, TOTAL } from '#lib/registry';

	const failures = [
		{
			wrong: 'The button jumps',
			right:
				'A label changes from Save to Saving and the button resizes, so the row beneath it moves and your cursor is suddenly over something else. Every state a component can reach has to reserve its width before it gets there.'
		},
		{
			wrong: 'The animation cannot be interrupted',
			right:
				'You click again halfway through and the transition restarts from the beginning, or worse, queues. A spring should resume from wherever it currently is, because that is where the element actually is.'
		},
		{
			wrong: 'Motion is the only channel',
			right:
				'With reduced motion on, most libraries either play the animation anyway or hide the element entirely. The information has to arrive either way. The trip is optional, the destination is not.'
		}
	];

	const moments: Array<[string, string]> = [
		['Action Feedback', 'You did something. Did it land?'],
		['Input', 'You are telling the system something it might reject.'],
		['Async', 'You are waiting, and you deserve to know on what.'],
		['Notification', 'The system is telling you something you did not ask for.'],
		['Overlay', 'Something came on top. It has to know where it came from.'],
		['Navigation', 'You moved. The interface should agree about where.'],
		['Scroll', 'You are reading, and the page is reacting to that.'],
		['Data', 'A number changed. Which one, and by how much?'],
		['Gesture', 'Your finger is on it. Physics is now part of the API.'],
		['Content', 'The thing itself arrives, resolves, or is missing.']
	];

	const first = $derived(readyEntries[0]);
</script>

<svelte:head>
	<title>Why this exists - interior[.]svelte</title>
	<meta
		name="description"
		content="Every team builds these. Nobody agrees on how. This is the argument for one way."
	/>
</svelte:head>

<div class="mx-auto max-w-170 px-6 py-12 sm:px-10">
	<header>
		<h1 class="text-[27px] leading-[1.15] font-medium tracking-[-0.03em] text-ink">
			Why this exists
		</h1>
		<p class="mt-3.5 text-[15px] leading-relaxed text-ink-2">
			None of these are hard components. That is exactly the problem. Every team writes them, nobody
			is given a week to write them, and so they ship at eighty percent and stay there for the life
			of the product.
		</p>
		<p class="mt-3 text-[15px] leading-relaxed text-ink-2">
			Nobody chooses a product because its accordion animated well. But people do quietly decide
			software is cheap, and they decide it in the first thirty seconds, from a dozen small moments
			that were almost right.
		</p>
	</header>

	<section class="mt-12">
		<h2 class="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
			The three failures
		</h2>
		<p class="mt-3 text-[13.5px] leading-relaxed text-ink-2">
			Almost every animated component library ships all three. They are not hard problems. They are
			just invisible until they are not.
		</p>

		<ol class="mt-5 grid gap-2">
			{#each failures as failure, i (failure.wrong)}
				<li class="mat-panel rounded-[13px] p-4">
					<div class="flex items-baseline gap-2.5">
						<span
							class="mat-well tnum grid size-4.5 shrink-0 place-items-center rounded-[5px] font-mono text-[9.5px] text-ink-3"
						>
							{i + 1}
						</span>
						<h3 class="text-[13.5px] font-medium tracking-[-0.01em] text-ink">{failure.wrong}</h3>
					</div>
					<p class="mt-2 pl-7 text-[13px] leading-relaxed text-ink-2">{failure.right}</p>
				</li>
			{/each}
		</ol>
	</section>

	<section class="mt-12">
		<h2 class="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">What you get</h2>
		<p class="mt-3 text-[13.5px] leading-relaxed text-ink-2">
			A file. Not an install, not a wrapper, not a config object with nineteen keys. The component
			is copied into your project and it becomes yours, including the parts you disagree with.
		</p>
		<p class="mt-3 text-[13.5px] leading-relaxed text-ink-2">
			Each page carries the command that copies it in, and states the dependencies that particular
			component actually needs - which for most of them is none.
		</p>
		<p class="mt-3 text-[13.5px] leading-relaxed text-ink-2">
			Every component states what it refuses to get wrong, and the demo on its page can be replayed,
			because a micro-interaction you can only watch once is a screenshot with extra steps.
		</p>
	</section>

	<section class="mt-12">
		<h2 class="text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">Ten moments</h2>
		<p class="mt-3 text-[13.5px] leading-relaxed text-ink-2">
			The set is not organised by widget type. It is organised by what the person is in the middle
			of when the interaction happens.
		</p>

		<dl class="mt-5 grid gap-px overflow-hidden rounded-[13px]">
			{#each moments as [name, line] (name)}
				<div
					class="mat-panel flex flex-col gap-1 px-4 py-3 first:rounded-t-[13px] last:rounded-b-[13px] sm:flex-row sm:items-baseline sm:gap-4"
				>
					<dt class="w-32.5 shrink-0 text-[13px] font-medium text-ink">{name}</dt>
					<dd class="text-[13px] leading-relaxed text-ink-2">{line}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<div class="mt-12 flex flex-wrap items-center gap-2.5">
		{#if first}
			<a
				href="/docs/{first.slug}"
				class="press inline-flex h-9 items-center rounded-[9px] bg-ink px-3.5 text-[13px] font-medium text-panel"
			>
				Start with {first.name}
			</a>
			<span class="text-[12px] text-ink-3">
				{SHIPPED} of {TOTAL} shipped, across {categories.length} sections on the left
			</span>
		{:else}
			<span class="text-[12px] text-ink-3">
				Nothing has shipped yet - {TOTAL} components across {categories.length} sections are on the way.
			</span>
		{/if}
	</div>
</div>
