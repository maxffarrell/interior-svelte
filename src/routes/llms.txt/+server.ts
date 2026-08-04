import { allEntries } from '#lib/registry';

const SITE = 'https://interior.spelte.dev';

export const prerender = true;

export function GET() {
	const sections = allEntries
		.map((entry) => `- ${entry.id} ${entry.name}: ${entry.blurb}. Docs: ${SITE}/docs/${entry.slug}`)
		.join('\n');

	return new Response(
		[
			'# interior[.]svelte',
			'',
			'Micro-interactions for Svelte, built for the half-second after a click.',
			'',
			`- Website: ${SITE}`,
			`- Registry: ${SITE}/r/index.json`,
			`- Source: https://github.com/max-got/interior-dev-svelte`,
			'',
			sections
		].join('\n'),
		{ headers: { 'content-type': 'text/plain; charset=utf-8' } }
	);
}
