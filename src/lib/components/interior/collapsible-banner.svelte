<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type BannerState = 'open' | 'folded' | 'dismissed';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		title: string;
		description?: string;
		children?: Snippet;
		action?: Snippet;
		icon?: Snippet;
		dismissible?: boolean;
		state?: BannerState;
		defaultState?: BannerState;
		onStateChange?: (state: BannerState) => void;
		onDismiss?: () => void;
		dismissLabel?: string;
		dismissedMessage?: string;
	};
</script>

	<script lang="ts">
		// @ts-nocheck
		import { reducedMotion } from '#lib/reduced-motion.svelte';

		const EASE = [0.23, 1, 0.32, 1] as const;
		const DISCLOSE = { type: 'spring', stiffness: 190, damping: 30, mass: 1 } as const;
		const NUDGE = { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 } as const;
		const INSTANT = { duration: 0 } as const;

	let {
		title,
		description,
		children,
		action,
		icon,
		dismissible = true,
		state: controlled,
		defaultState = 'open',
		onStateChange,
		onDismiss,
		dismissLabel = 'Dismiss notice',
		dismissedMessage = 'Notice dismissed.',
		class: className
	}: Props = $props();

	let internal = $state<BannerState>(defaultState);
	const state = $derived(controlled ?? internal);
	const open = $derived(state === 'open');
	const dismissed = $derived(state === 'dismissed');
	const hasBody = $derived(Boolean(description || children || action));
	const id = $props.id();
		const bodyId = `${id}-body`;
		const titleId = `${id}-title`;
		const disclose = $derived(
			reducedMotion.current
				? INSTANT
				: {
						height: DISCLOSE,
						opacity: { duration: 0.14, ease: EASE, delay: open ? 0.05 : 0 },
						y: DISCLOSE
					}
		);

	function commit(next: BannerState) {
		internal = next;
		onStateChange?.(next);
	}
	function toggle() { commit(open ? 'folded' : 'open'); }
	function fold() { commit('folded'); }
	function dismiss() {
		commit('dismissed');
		onDismiss?.();
	}
	function restore() { commit('open'); }
</script>

<div style:overflow="hidden" class="rounded-[11px]">
	<div role="region" aria-labelledby={titleId} class="rounded-[11px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}">
		<div class="flex items-center gap-2.5 p-2.5">
			<span aria-hidden="true" class="grid size-[26px] shrink-0 place-items-center rounded-[7px] bg-stone-100/70 text-stone-500 shadow-[inset_0_1px_2px_rgba(28,25,23,0.06)] dark:bg-[#252522] dark:text-stone-400 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
				{#if icon}{@render icon()}{:else}<svg width="16" height="16" viewBox="0 0 256 256" fill="none" aria-hidden="true"><circle cx="128" cy="128" r="96" stroke="currentColor" stroke-width="16" /><polyline points="120 120 128 120 128 176 136 176" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /><circle cx="124" cy="84" r="12" fill="currentColor" /></svg>{/if}
			</span>

			{#if hasBody}
				<button
					type="button"
					onclick={toggle}
					onkeydown={(event) => {
						if (event.key === 'Escape' && open) {
							event.stopPropagation();
							fold();
						}
					}}
					aria-expanded={open}
					aria-controls={bodyId}
					class="group flex min-w-0 flex-1 items-center gap-2 rounded-[7px] text-left outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
				>
					<span id={titleId} class="min-w-0 flex-1 truncate text-[13px] font-medium leading-5 text-stone-700 dark:text-stone-100">{title}</span>
					<span aria-hidden="true" class="flex shrink-0 text-stone-400 transition-transform duration-200 group-hover:text-stone-600 dark:text-stone-500 dark:group-hover:text-stone-300" class:rotate-180={open}><svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden="true"><polyline points="208 96 128 176 48 96" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
				</button>
			{:else}
				<span id={titleId} class="min-w-0 flex-1 truncate text-[13px] font-medium leading-5 text-stone-700 dark:text-stone-100">{title}</span>
			{/if}

			{#if dismissible}
				<button type="button" onclick={dismiss} aria-label={dismissLabel} class="grid size-[26px] shrink-0 place-items-center rounded-[7px] text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-100 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"><svg width="13" height="13" viewBox="0 0 256 256" fill="none" aria-hidden="true"><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-width="16" stroke-linecap="round" /><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-width="16" stroke-linecap="round" /></svg></button>
			{/if}
		</div>

		{#if hasBody}
			<div id={bodyId} inert={!open} class="grid overflow-hidden transition-[grid-template-rows,opacity]" style:grid-template-rows={open ? '1fr' : '0fr'} style:opacity={open ? 1 : 0}>
				<div class="min-h-0 pb-2.5 pl-[46px] pr-2.5">
					{#if description}<p class="text-[12.5px] leading-relaxed text-stone-500 dark:text-stone-400">{description}</p>{/if}
					{@render children?.()}
					{#if action}<div class="mt-2">{@render action()}</div>{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<span role="status" aria-live="polite" class="sr-only">{dismissed ? dismissedMessage : ''}</span>
