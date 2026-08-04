import { readyEntries } from '#lib/registry';

const SITE = 'https://interior.spelte.dev';

export const prerender = true;

const sources = import.meta.glob('/src/lib/components/interior/*.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

export function GET() {
	const raw = readyEntries
		.map((entry) => {
			const source = sources[`/src/lib/components/interior/${entry.slug}.svelte`];
			return [
				`## ${entry.name}`,
				'',
				`${entry.blurb}.`,
				'',
				`Docs: ${SITE}/docs/${entry.slug}`,
				`Install: \`pnpm dlx shadcn-svelte@latest add ${SITE}/r/${entry.slug}.json\``,
				'',
				'### Source',
				'```svelte',
				source,
				'```'
			].join('\n');
		})
		.join('\n\n');

	return new Response(`# interior[.]svelte\n\n${raw}\n`, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
