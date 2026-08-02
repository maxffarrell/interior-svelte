import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allEntries, categories, getCategoryOf, getEntry, readyEntries, TOTAL } from './index';
import { meta } from './meta';

describe('registry', () => {
	it('carries the whole set', () => {
		expect(TOTAL).toBe(54);
		expect(categories).toHaveLength(10);
	});

	it('has unique slugs and ids', () => {
		expect(new Set(allEntries.map((e) => e.slug)).size).toBe(TOTAL);
		expect(new Set(allEntries.map((e) => e.id)).size).toBe(TOTAL);
	});

	it('marks an entry ready exactly when it has a meta entry', () => {
		const ready = new Set(readyEntries.map((e) => e.slug));
		const documented = new Set(Object.keys(meta));
		expect([...ready].sort()).toEqual([...documented].sort());
	});

	it('gives every ready entry a source path and no planned entry one', () => {
		for (const entry of allEntries) {
			if (entry.status === 'ready') {
				expect(entry.src).toBe(`src/lib/components/interior/${entry.slug}.svelte`);
			} else {
				expect(entry.src).toBeUndefined();
			}
		}
	});

	it('has no meta entry for a slug the registry does not know', () => {
		const slugs = new Set(allEntries.map((e) => e.slug));
		expect(Object.keys(meta).filter((slug) => !slugs.has(slug))).toEqual([]);
	});

	it('gives every ready entry a usage example that imports the component it documents', () => {
		for (const entry of readyEntries) {
			const path = `src/lib/usage/${entry.slug}.usage.svelte`;
			expect(existsSync(path), `${entry.slug} has no usage example at ${path}`).toBe(true);

			// The example is what a reader copies, so it has to exercise the real component
			// rather than sit there compiling. `#lib` is rewritten to `$lib` when rendered.
			const code = readFileSync(path, 'utf8');
			expect(code, `${path} never imports ${entry.slug}`).toContain(
				`#lib/components/interior/${entry.slug}.svelte`
			);
		}
	});

	it('resolves entries and their categories by slug', () => {
		expect(getEntry('copy-button')?.name).toBe('Copy Button');
		expect(getCategoryOf('copy-button')?.name).toBe('Action Feedback');
		expect(getEntry('nope')).toBeUndefined();
		expect(getCategoryOf('nope')).toBeUndefined();
	});
});
