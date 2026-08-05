<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type PresencePerson = { id: string; name: string; src?: string };
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		people: PresencePerson[];
		max?: number;
		size?: number;
		overlap?: number;
		label?: string;
		announceAfter?: number;
		onOverflowSelect?: (hidden: PresencePerson[]) => void;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	const SLOT = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const FADE = { duration: 0.24, ease: [0.23, 1, 0.32, 1] } as const;
		const seen = new Map<string, number>();
		let next = 0;
		let imageStates = $state<Record<string, 'loading' | 'loaded' | 'failed'>>({});

	let { people, max = 5, size = 28, overlap = 9, label = 'People here', announceAfter = 900, onOverflowSelect, class: className, ...rest }: Props = $props();

	const ordered = $derived.by(() => {
		for (const person of people) {
			if (!seen.has(person.id)) seen.set(person.id, next++);
		}
		return people.slice().sort((a, b) => (seen.get(a.id) ?? 0) - (seen.get(b.id) ?? 0));
	});
	const slots = $derived(Math.max(1, max));
	const visible = $derived(ordered.slice(0, slots));
	const hidden = $derived(ordered.slice(slots));
	const overflow = $derived(hidden.length);
	const step = $derived(size - overlap);
	const chip = $derived(size + 8);
	const rail = $derived(visible.length === 0 ? 0 : overflow > 0 ? visible.length * step + chip : (visible.length - 1) * step + size);
	const summary = $derived.by(() => {
		const names = ordered.map((person) => person.name);
		if (names.length === 0) return 'Nobody here';
		if (names.length === 1) return `${names[0]} is here`;
		if (names.length === 2) return `${names[0]} and ${names[1]} are here`;
		const restCount = names.length - 2;
		return `${names[0]}, ${names[1]} and ${restCount} ${restCount === 1 ? 'other' : 'others'} are here`;
	});
	let announcement = $state(summary);

	$effect(() => {
		const timer = setTimeout(() => (announcement = summary), announceAfter);
		return () => clearTimeout(timer);
	});

	function initials(name: string) {
		const words = name.trim().split(/\s+/).filter(Boolean);
		if (!words.length) return '?';
		return ((Array.from(words[0])[0] ?? '') + (words.length > 1 ? Array.from(words.at(-1) ?? '')[0] ?? '' : '')).toUpperCase();
	}
</script>

<div {...rest} role="group" aria-label={label} class="inline-flex items-center {className ?? ''}">
	<motion.div class="relative shrink-0" style={`height: ${size}px`} initial={false} animate={{ width: rail }} transition={reducedMotion.current ? { duration: 0 } : SLOT}>
		<AnimatePresence initial={false}>
			{#each visible as person, index (person.id)}
				<motion.span
					aria-hidden="true"
					initial={{ opacity: 0, scale: 0.86, x: index * step }}
					animate={{ opacity: 1, scale: 1, x: index * step }}
					exit={{ opacity: 0, scale: 0.86 }}
					transition={reducedMotion.current ? { duration: 0 } : SLOT}
					style={`width: ${size}px; height: ${size}px; z-index: ${slots - index}; font-size: ${Math.round(size * 0.34)}px;`}
					class="absolute top-0 left-0 select-none rounded-[10px] bg-stone-200 p-[3px] dark:bg-stone-700"
				>
					<span class="relative grid size-full place-items-center overflow-hidden rounded-[7px] bg-stone-100 font-medium leading-none text-stone-500 dark:bg-white/10 dark:text-stone-300">
						{initials(person.name)}
						{#if person.src && imageStates[person.id] !== 'failed'}
							<motion.img
								src={person.src}
								alt=""
								width={size}
								height={size}
								decoding="async"
								onload={() => (imageStates[person.id] = 'loaded')}
								onerror={() => (imageStates[person.id] = 'failed')}
								initial={false}
								animate={{ opacity: imageStates[person.id] === 'loaded' ? 1 : 0 }}
								transition={reducedMotion.current ? { duration: 0 } : FADE}
								class="absolute inset-0 size-full object-cover"
							/>
						{/if}
					</span>
				</motion.span>
			{/each}

			{#if overflow > 0}
				{#if onOverflowSelect}
					<motion.button type="button" onclick={() => onOverflowSelect?.(hidden)} aria-label={`Show ${overflow} more`} style={`width: ${chip}px; height: ${size}px; z-index: 0;`} initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1, x: visible.length * step }} exit={{ opacity: 0, scale: 0.86 }} transition={reducedMotion.current ? { duration: 0 } : SLOT} class="absolute top-0 left-0 grid place-items-center rounded-[9px] border border-stone-200 bg-white font-mono text-[10.5px] leading-none tabular-nums text-stone-500 outline-none ring-2 ring-white focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-400 dark:ring-stone-900 dark:focus-visible:border-[#93B0FF]"><span aria-hidden="true">+{Math.min(overflow, 99)}</span></motion.button>
				{:else}
					<motion.span aria-hidden="true" style={`width: ${chip}px; height: ${size}px; z-index: 0;`} initial={{ opacity: 0, scale: 0.86 }} animate={{ opacity: 1, scale: 1, x: visible.length * step }} exit={{ opacity: 0, scale: 0.86 }} transition={reducedMotion.current ? { duration: 0 } : SLOT} class="absolute top-0 left-0 grid place-items-center rounded-[9px] border border-stone-200 bg-white font-mono text-[10.5px] leading-none tabular-nums text-stone-500 outline-none ring-2 ring-white dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-400 dark:ring-stone-900">+{Math.min(overflow, 99)}</motion.span>
				{/if}
			{/if}
		</AnimatePresence>
	</motion.div>
	<ul class="sr-only">{#each ordered as person (person.id)}<li>{person.name}</li>{/each}</ul>
	<span role="status" aria-live="polite" aria-atomic="true" class="sr-only">{announcement}</span>
</div>
