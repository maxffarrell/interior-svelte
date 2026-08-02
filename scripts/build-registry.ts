import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readyEntries } from '../src/lib/registry/index';
import { meta } from '../src/lib/registry/meta';

const HOMEPAGE = 'https://interior-svelte.pages.dev';
const OUT_DIR = 'static/r';

/**
 * SvelteKit 3 removed `$lib` in favour of Node subpath imports, so this project uses
 * `#lib`. shadcn-svelte only tokenises `$lib`-prefixed specifiers, so a `#lib` import
 * would ship verbatim and fail to resolve in the consumer's project. Rewrite them.
 *
 * Longest prefix first. Anything not covered here is caught by the assertion below
 * rather than shipped broken.
 */
const ALIASES: Array<[from: string, to: string]> = [
	['#lib/utils', '$UTILS$'],
	['#lib/reduced-motion.svelte', '$LIB$/reduced-motion.svelte']
];

const SHARED: Array<{ importedAs: string; path: string; type: string }> = [
	{ importedAs: '#lib/utils', path: './src/lib/utils.ts', type: 'registry:lib' },
	{
		importedAs: '#lib/reduced-motion.svelte',
		path: './src/lib/reduced-motion.svelte.ts',
		type: 'registry:lib'
	}
];

function generateManifest() {
	const items = readyEntries.map((entry) => {
		const m = meta[entry.slug];
		const componentPath = `./src/lib/components/interior/${entry.slug}.svelte`;
		const source = readFileSync(componentPath, 'utf8');

		return {
			name: entry.slug,
			type: 'registry:block',
			title: entry.name,
			description: `${entry.blurb}.`,
			...(m.dependencies?.length ? { dependencies: m.dependencies } : {}),
			registryDependencies: m.registryDependencies ?? [],
			files: [
				{
					path: componentPath,
					type: 'registry:component',
					target: `interior/${entry.slug}.svelte`
				},
				// Extra files this component ships, declared by the component itself.
				...(m.files ?? []),
				// Only what this component actually imports.
				...SHARED.filter((s) => source.includes(s.importedAs)).map(({ path, type }) => ({
					path,
					type
				}))
			]
		};
	});

	writeFileSync(
		'registry.json',
		`${JSON.stringify({ $schema: 'https://shadcn-svelte.com/schema/registry.json', name: 'interior-svelte', homepage: HOMEPAGE, items }, null, '\t')}\n`
	);

	return items.length;
}

function rewriteAliases() {
	const unportable: string[] = [];

	for (const file of readdirSync(OUT_DIR).filter((f) => f.endsWith('.json'))) {
		const path = join(OUT_DIR, file);
		let raw = readFileSync(path, 'utf8');

		for (const [from, to] of ALIASES) raw = raw.replaceAll(from, to);

		for (const line of raw.split('\\n')) {
			if (line.includes('#lib')) unportable.push(`${file}: ${line.trim()}`);
		}

		writeFileSync(path, raw);
	}

	if (unportable.length > 0) {
		console.error(
			`\n${unportable.length} unportable import(s) would ship to consumers.\n` +
				`Add a mapping to ALIASES in scripts/build-registry.ts:\n\n` +
				unportable.map((l) => `  ${l}`).join('\n') +
				'\n'
		);
		process.exit(1);
	}
}

const count = generateManifest();
console.log(`registry.json - ${count} item(s)`);

execFileSync('shadcn-svelte', ['registry', 'build', './registry.json', '-o', `./${OUT_DIR}`], {
	stdio: 'inherit',
	preferLocal: true,
	shell: process.platform === 'win32'
} as never);

rewriteAliases();
console.log(`${OUT_DIR} - aliases rewritten, no unportable imports`);
