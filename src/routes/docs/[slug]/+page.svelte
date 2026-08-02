<script lang="ts">
	import CodeBlock from '#lib/components/docs/code-block.svelte';
	import Enter from '#lib/components/docs/enter.svelte';
	import Preview from '#lib/components/docs/preview.svelte';
	import TerminalBlock from '#lib/components/docs/terminal-block.svelte';
	import { bleedDemos, demos } from '#lib/demos';
	import { sheet } from './sheet.remote';

	let { params } = $props();

	const data = $derived(await sheet(params.slug));

	const entry = $derived(data.entry);
	const Demo = $derived(demos[entry.slug]);
</script>

<svelte:head>
	<title>{entry.name} — interior[.]svelte</title>
	<meta name="description" content={entry.blurb} />
</svelte:head>

<article class="mx-auto max-w-185 px-6 pt-11 pb-24 sm:px-10">
	<Enter>
		<header>
			<p class="flex items-center gap-1.5 text-[11px] text-ink-3">
				<span>{data.category?.name}</span>
				<span class="text-ink-3/60">·</span>
				<span class="tnum font-mono">{entry.id}</span>
			</p>

			<h1 class="mt-3 text-[27px] leading-[1.15] font-medium tracking-[-0.03em] text-ink">
				{entry.name}
			</h1>
			<p class="mt-2.5 max-w-[54ch] text-[14px] leading-relaxed text-ink-2">{entry.blurb}.</p>
		</header>
	</Enter>

	<Enter delay={0.07} class="mt-8">
		<Preview label={entry.slug} bleed={bleedDemos.has(entry.slug)}>
			<Demo />
		</Preview>
	</Enter>

	<Enter delay={0.14}>
		<h2 class="mt-12 mb-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
			Install
		</h2>
		<p class="mb-3 max-w-[58ch] text-[13.5px] leading-relaxed text-ink-2">
			The component is copied into your project, so the file is yours after that.
			{#if data.dependencies.length > 0}
				It needs
				{#each data.dependencies as dep, i (dep)}<code
						class="mat-well rounded-[5px] px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2"
						>{dep}</code
					>{#if i < data.dependencies.length - 2},
					{:else if i === data.dependencies.length - 2}
						and
					{/if}{/each}.
			{:else}
				It has no dependencies of its own.
			{/if}
		</p>
		<TerminalBlock commands={data.install} />

		{#if data.usage}
			<h2 class="mt-12 mb-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
				Usage
			</h2>
			<CodeBlock html={data.usage.html} code={data.usage.code} filename="+page.svelte" />
		{/if}

		<h2 class="mt-12 mb-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
			Source
		</h2>
		<!-- Every file the component ships, not just the one with the markup in it. -->
		<div class="space-y-7">
			{#each data.sources as file (file.path)}
				<CodeBlock html={file.html} code={file.code} filename={file.path} />
			{/each}
		</div>

		{#if entry.props?.length}
			<h2 class="mt-12 mb-3 text-[11px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
				Props
			</h2>
			<div class="mat-panel divide-y divide-hairline rounded-[14px] px-4">
				{#each entry.props as prop (prop.name)}
					<div class="grid gap-x-5 gap-y-1.5 py-3.5 sm:grid-cols-[168px_minmax(0,1fr)]">
						<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
							<code class="font-mono text-[12px] font-medium text-ink">{prop.name}</code>
							{#if prop.default}
								<span
									class="mat-well tnum rounded-[5px] px-1.5 py-0.5 font-mono text-[10px] text-ink-3"
								>
									{prop.default}
								</span>
							{/if}
						</div>
						<div class="min-w-0">
							<code class="font-mono text-[11px] text-accent">{prop.type}</code>
							<p class="mt-1 text-[13px] leading-relaxed text-ink-2">{prop.note}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Enter>
</article>
