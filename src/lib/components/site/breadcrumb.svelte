<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
	import { routes } from '$app/manifest';
	import { page } from '$app/state';
	import { getCategoryOf, getEntry } from '#lib/registry';
	import { cn } from '#lib/utils';

	let { class: className, ...rest }: Props = $props();

	const docsRoute = routes.find(({ id }) => id === '/docs')?.id;
	const slug = $derived(
		page.url.pathname.startsWith(docsRoute!) ? page.url.pathname.slice(6) : null
	);
	const entry = $derived(slug ? getEntry(slug) : undefined);
	const category = $derived(slug ? getCategoryOf(slug) : undefined);
</script>

<div {...rest} class={cn('flex min-w-0 items-center gap-1.5 text-[12px]', className)}>
	<a href="/docs" class="text-ink-3 transition-colors hover:text-ink-2">Components</a>

	{#if category}
		<span class="text-ink-3/60">·</span>
		<span class="text-ink-3">{category.name}</span>
	{/if}

	{#if entry}
		<span class="text-ink-3/60">·</span>
		<span class="truncate font-medium text-ink-2">{entry.name}</span>
	{/if}
</div>
