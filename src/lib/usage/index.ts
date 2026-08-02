import type { Component } from 'svelte';

const SLUG = /^\.\/(.+)\.example\.svelte$/;

/**
 * Only the `.example.svelte` half is imported. The `.usage.svelte` file beside it is read
 * as text by `sheet.remote.ts` and never enters the module graph, which is what lets it
 * call `fetch`, `goto` and `sendBeacon` without any of that reaching a bundle.
 *
 * A glob rather than the hand-written map `#lib/demos` keeps: static imports buy no
 * exhaustiveness check here, because `noUncheckedIndexedAccess` is off and indexing a
 * `Record<string, Component>` is typed `Component` either way. `registry.spec.ts` is what
 * fails when a ready slug has no example.
 */
const modules = import.meta.glob('./*.example.svelte', {
	eager: true,
	import: 'default'
}) as Record<string, Component>;

export const examples: Record<string, Component> = Object.fromEntries(
	Object.entries(modules).map(([path, component]) => [SLUG.exec(path)![1], component])
);
