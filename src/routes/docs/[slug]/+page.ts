import { readyEntries } from '#lib/registry';
import type { EntryGenerator } from './$types';

/** The HTML itself is prerendered too, so the docs are static files, not a render. */
export const prerender = true;

export const entries: EntryGenerator = () => readyEntries.map((e) => ({ slug: e.slug }));
