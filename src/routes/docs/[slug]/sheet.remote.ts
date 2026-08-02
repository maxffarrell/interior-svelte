import { error } from '@sveltejs/kit';
import { prerender } from '$app/server';
import type { Command } from '#lib/components/docs/terminal-block.svelte';
import { getCategoryOf, getEntry, readyEntries } from '#lib/registry';
import { meta } from '#lib/registry/meta';
import { highlight, type Lang } from '#lib/highlight';
import { dlx, packageManagers, type PackageManager } from '#lib/package-manager.svelte';

const rawSources = import.meta.glob('/src/lib/components/interior/*.{svelte,svelte.ts}', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const usages = import.meta.glob('/src/lib/usage/*.usage.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const SITE = 'https://interior-svelte.pages.dev';

/**
 * Our own files import through `#lib`, because SvelteKit 3 removed `$lib`. What a reader
 * should see is whatever *their* project resolves, so both listings are normalised here
 */
const CONSUMER_LIB = '$lib/';

function asConsumerWrites(code: string) {
	return code.replaceAll('#lib/', CONSUMER_LIB);
}

/**
 * A component is whatever `shadcn-svelte add` writes into your project, which for some
 * of them is more than one file — the rune module behind `hold-to-confirm`, say. The
 * extra files are read from the same `meta.files` list the registry manifest is built
 * from, so the Source section and the thing you install cannot list different files.
 */
function sourceFiles(slug: string) {
	const paths = [
		`src/lib/components/interior/${slug}.svelte`,
		...(meta[slug]?.files ?? []).map((f) => f.path.replace(/^\.\//, ''))
	];

	return paths.map((path) => {
		const raw = rawSources[`/${path}`];
		if (!raw) error(500, `Registry lists ${path} for ${slug} but the file is missing`);
		return { path, code: asConsumerWrites(raw), lang: langOf(path) };
	});
}

function langOf(path: string): Lang {
	return path.endsWith('.svelte') ? 'svelte' : 'ts';
}

export const sheet = prerender(
	'unchecked',
	async (slug: string) => {
		const entry = getEntry(slug);
		if (!entry || entry.status !== 'ready') error(404, 'No such component');

		const files = await Promise.all(
			sourceFiles(entry.slug).map(async ({ path, code, lang }) => ({
				path,
				code,
				html: await highlight(code, lang)
			}))
		);

		const rawUsage = usages[`/src/lib/usage/${entry.slug}.usage.svelte`];
		const usage = rawUsage ? asConsumerWrites(rawUsage) : null;

		const install = {} as Record<PackageManager, Command>;
		for (const pm of packageManagers) {
			const code = `${dlx[pm]} shadcn-svelte@latest add ${SITE}/r/${entry.slug}.json`;
			install[pm] = { code, html: await highlight(code, 'bash') };
		}

		return {
			entry,
			category: getCategoryOf(entry.slug),
			dependencies: meta[entry.slug]?.dependencies ?? [],
			install,
			sources: files,
			usage: usage ? { code: usage, html: await highlight(usage, 'svelte') } : null
		};
	},
	{ inputs: () => readyEntries.map((e) => e.slug) }
);
