<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type PaginationItem = number | 'gap-l' | 'gap-r';
	export type Props = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
		count: number;
		page?: number;
		defaultPage?: number;
		siblings?: number;
		boundaries?: number;
		onPageChange?: (page: number) => void;
		label?: string;
	};

	const range = (from: number, to: number) =>
		Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

	export function paginate(
		page: number,
		count: number,
		siblings = 1,
		boundaries = 1
	): PaginationItem[] {
		const total = 2 * boundaries + 2 * siblings + 3;
		if (count <= total) return range(1, count);

		const nearStart = page < boundaries + siblings + 2;
		const nearEnd = page > count - boundaries - siblings - 1;
		if (nearStart) {
			return [
				...range(1, 2 * siblings + boundaries + 2),
				'gap-r',
				...range(count - boundaries + 1, count)
			];
		}
		if (nearEnd) {
			return [
				...range(1, boundaries),
				'gap-l',
				...range(count - 2 * siblings - boundaries - 1, count)
			];
		}
		return [
			...range(1, boundaries),
			'gap-l',
			...range(page - siblings, page + siblings),
			'gap-r',
			...range(count - boundaries + 1, count)
		];
	}
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		count,
		page = $bindable<number | undefined>(undefined),
		defaultPage = 1,
		siblings = 1,
		boundaries = 1,
		onPageChange,
		label = 'Pagination',
		class: className,
		...rest
	}: Props = $props();

	const clamp = (value: number) => Math.min(Math.max(1, value), Math.max(1, count));
	let internal = $state(clamp(defaultPage));
	let previous = $state(clamp(page ?? internal));
	let direction = $state(1);
	let spoken = $state('');
	let announceTimer: ReturnType<typeof setTimeout> | undefined;

	const current = $derived(clamp(page ?? internal));
	const items = $derived(paginate(current, count, siblings, boundaries));
	const digits = $derived(String(Math.max(1, count)).length);
	const slot = $derived(Math.max(32, 18 + digits * 8));
	const canPrev = $derived(current > 1);
	const canNext = $derived(current < count);
	const thumbIndex = $derived(items.indexOf(current));

	$effect(() => {
		if (previous !== current) {
			direction = current >= previous ? 1 : -1;
			previous = current;
		}
		clearTimeout(announceTimer);
		announceTimer = setTimeout(() => (spoken = `Page ${current} of ${Math.max(1, count)}`), 500);
		return () => clearTimeout(announceTimer);
	});

	function goTo(value: number) {
		const next = clamp(value);
		if (next === current) return;
		if (page === undefined) internal = next;
		onPageChange?.(next);
	}
</script>

<nav aria-label={label} class="inline-block {className ?? ''}" {...rest}>
	<div class="flex items-center gap-1">
		<button
			type="button"
			aria-label="Previous page"
			aria-disabled={!canPrev}
			onclick={() => canPrev && goTo(current - 1)}
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-stone-500 outline-none transition-colors duration-150 hover:bg-stone-100 hover:text-stone-800 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] disabled:text-stone-300 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-200 dark:disabled:text-white/20"
		>
			<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" class="-scale-x-100">
				<path d="M4.75 2.75 8 6l-3.25 3.25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<div class="relative">
			<span
				aria-hidden="true"
				class="absolute inset-y-0 left-0 rounded-[9px] bg-stone-800 dark:bg-stone-100"
				style:width={`${slot}px`}
				style:transform={`translateX(${thumbIndex * (slot + 4)}px)`}
				style:transition={reducedMotion.current ? 'none' : 'transform 520ms cubic-bezier(0.23, 1, 0.32, 1)'}
			></span>
			<ol class="relative flex gap-1">
				{#each items as item, index (`${item}-${index}`)}
					{#if typeof item !== 'number'}
						<li aria-hidden="true" style:width={`${slot}px`} class="flex h-8 items-center justify-center text-[12.5px] text-stone-400 dark:text-stone-500">&hellip;</li>
					{:else}
						<li style:width={`${slot}px`}>
							<button
								type="button"
								aria-label={`Page ${item}`}
								aria-current={item === current ? 'page' : undefined}
								onclick={() => goTo(item)}
								class="flex h-8 w-full items-center justify-center rounded-[9px] text-[12.5px] tabular-nums outline-none transition-colors duration-150 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] {item === current ? 'font-medium text-white dark:text-stone-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-200'}"
							>
								<span class:page-roll={!reducedMotion.current} data-direction={direction}>{item}</span>
							</button>
						</li>
					{/if}
				{/each}
			</ol>
		</div>
		<button
			type="button"
			aria-label="Next page"
			aria-disabled={!canNext}
			onclick={() => canNext && goTo(current + 1)}
			class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-stone-500 outline-none transition-colors duration-150 hover:bg-stone-100 hover:text-stone-800 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] disabled:text-stone-300 dark:text-stone-400 dark:hover:bg-white/[0.06] dark:hover:text-stone-200 dark:disabled:text-white/20"
		>
			<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M4.75 2.75 8 6l-3.25 3.25" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
		</button>
	</div>
	<span role="status" class="sr-only">{spoken}</span>
</nav>

<style>
	.page-roll { animation: page-roll 180ms cubic-bezier(0.23, 1, 0.32, 1); }
	@keyframes page-roll { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
	[data-direction='-1'].page-roll { animation-name: page-roll-back; }
	@keyframes page-roll-back { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
	@media (prefers-reduced-motion: reduce) { .page-roll { animation: none; } }
</style>
