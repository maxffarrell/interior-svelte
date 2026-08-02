import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Promise<Highlighter> | null = null;

function get() {
	highlighter ??= createHighlighter({
		themes: ['everforest-light', 'everforest-dark'],
		langs: ['svelte', 'ts', 'bash', 'css', 'json']
	});
	return highlighter;
}

export type Lang = 'svelte' | 'ts' | 'bash' | 'css' | 'json';

export async function highlight(code: string, lang: Lang = 'svelte') {
	const shiki = await get();
	return shiki.codeToHtml(code.trimEnd(), {
		lang,
		themes: { light: 'everforest-light', dark: 'everforest-dark' },
		defaultColor: false
	});
}
