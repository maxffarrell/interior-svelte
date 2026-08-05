<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type ScrollSpySection = { id: string; label: string };
	export type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
		sections: ScrollSpySection[];
		offset?: number;
		root?: HTMLElement | null;
		onChange?: (id: string) => void;
		label?: string;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;

	let {
		sections,
		offset = 96,
		root = null,
		onChange,
		label = 'On this page',
		class: className,
		...rest
	}: Props = $props();

	let activeId = $state(sections[0]?.id ?? '');
	let announce = $state('');
	let chips = $state<Record<string, HTMLElement | undefined>>({});
	let announceTimer: ReturnType<typeof setTimeout> | undefined;
	let programmaticLock = $state<string | null>(null);
	let programmaticRelease: ReturnType<typeof setTimeout> | undefined;
	let started = false;
	let resync = () => {};
	const thumbId = $props.id();

	function releaseLock() {
		programmaticLock = null;
		if (programmaticRelease) clearTimeout(programmaticRelease);
		programmaticRelease = undefined;
	}

	function measure(container: HTMLElement | null) {
		if (sections.length === 0) return '';
		const viewport = container ? container.clientHeight : window.innerHeight;
		const top = container ? container.scrollTop : window.scrollY;
		const max = container ? container.scrollHeight - container.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
		const ratio = max > 0 ? Math.min(1, Math.max(0, top / max)) : 1;
		const line = (container ? container.getBoundingClientRect().top : 0) + offset + ratio * Math.max(0, viewport - offset - 1);
		let current = '';
		let last = '';
		for (const section of sections) {
			const node = document.getElementById(section.id);
			if (!node) continue;
			last = section.id;
			if (!current) current = section.id;
			if (node.getBoundingClientRect().top <= line + 1) current = section.id;
		}
		const atEnd = container
			? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
			: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
		return atEnd && last ? last : current;
	}

	$effect(() => {
		const container = root;
		const source: EventTarget = container ?? window;
		let frame = 0;
		const sync = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const next = measure(container);
				if (!next) return;
				if (programmaticLock) {
					if (programmaticLock === next) releaseLock();
					return;
				}
				if (next !== activeId) activeId = next;
			});
		};
		resync = sync;
		const abandon = () => { if (programmaticLock) releaseLock(); };
		source.addEventListener('scroll', sync, { passive: true });
		window.addEventListener('resize', sync);
		window.addEventListener('wheel', abandon, { passive: true });
		window.addEventListener('touchstart', abandon, { passive: true });
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(sync);
		observer?.observe(container ?? document.documentElement);
		for (const section of sections) {
			const node = document.getElementById(section.id);
			if (node) observer?.observe(node);
		}
		sync();
		return () => {
			source.removeEventListener('scroll', sync);
			window.removeEventListener('resize', sync);
			window.removeEventListener('wheel', abandon);
			window.removeEventListener('touchstart', abandon);
			observer?.disconnect();
			if (frame) cancelAnimationFrame(frame);
			if (programmaticRelease) clearTimeout(programmaticRelease);
			resync = () => {};
		};
	});

	$effect(() => {
		if (!activeId) return;
		onChange?.(activeId);
		if (!started) {
			started = true;
			chips[activeId]?.scrollIntoView({ behavior: reducedMotion.current ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
			return;
		}
		announceTimer = setTimeout(() => {
			announce = sections.find((section) => section.id === activeId)?.label ?? '';
		}, 420);
		chips[activeId]?.scrollIntoView({ behavior: reducedMotion.current ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
		return () => clearTimeout(announceTimer);
	});

	function scrollTo(id: string) {
		const node = document.getElementById(id);
		if (!node) return;
		activeId = id;
		programmaticLock = id;
		if (programmaticRelease) clearTimeout(programmaticRelease);
		programmaticRelease = setTimeout(() => {
			programmaticLock = null;
			programmaticRelease = undefined;
			resync();
		}, 900);
		const container = root;
		const rect = node.getBoundingClientRect();
		const viewport = container ? container.clientHeight : window.innerHeight;
		const max = container ? Math.max(0, container.scrollHeight - container.clientHeight) : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
		const absoluteTop = container ? rect.top - container.getBoundingClientRect().top + container.scrollTop : rect.top + window.scrollY;
		const usable = Math.max(0, viewport - offset - 1);
		const top = max > 0 ? Math.min(max, Math.max(0, (absoluteTop - offset) / (1 + usable / max))) : 0;
		if (container) container.scrollTo({ top, behavior: reducedMotion.current ? 'auto' : 'smooth' });
		else window.scrollTo({ top, behavior: reducedMotion.current ? 'auto' : 'smooth' });
		if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
		node.focus({ preventScroll: true });
	}
</script>

<nav aria-label={label} class="w-full {className ?? ''}" {...rest}>
	<div class="rounded-[10px] bg-stone-100/80 p-1 shadow-[inset_0_1px_2px_rgba(28,25,23,0.07)] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]">
		<ol class="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{#each sections as section (section.id)}
				{@const active = section.id === activeId}
				<li bind:this={chips[section.id]} class="relative flex-[1_0_auto]">
					{#if active}<motion.span layoutId={reducedMotion.current ? undefined : thumbId} aria-hidden="true" transition={CELL} class="absolute inset-0 rounded-[6px] bg-stone-800 dark:bg-stone-100"></motion.span>{/if}
					<a
						href={`#${section.id}`}
						aria-current={active ? 'location' : undefined}
						onclick={(event) => {
							if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
							event.preventDefault();
							scrollTo(section.id);
						}}
						class="group relative flex h-7 w-full items-center justify-center rounded-[6px] px-2.5 text-[12.5px] outline-none after:pointer-events-none after:absolute after:inset-0 after:rounded-[6px] focus-visible:after:bg-[#4568FF]/[0.06] focus-visible:after:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:after:bg-[#93B0FF]/[0.1] dark:focus-visible:after:shadow-[inset_0_0_0_1px_#93B0FF]"
					>
						<span class="relative grid">
							<span aria-hidden="true" class="invisible col-start-1 row-start-1 whitespace-nowrap font-medium">{section.label}</span>
							<span class="col-start-1 row-start-1 whitespace-nowrap transition-colors duration-150 {active ? 'font-medium text-white dark:text-stone-900' : 'text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-200'}">{section.label}</span>
						</span>
					</a>
				</li>
			{/each}
		</ol>
	</div>
	<p aria-live="polite" class="sr-only">{announce}</p>
</nav>
