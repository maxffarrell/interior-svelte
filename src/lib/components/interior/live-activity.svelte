<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Activity } from './live-activity.state.svelte';

	export type { Activity, ActivityAction, ActivityInput, ActivityPhase } from './live-activity.state.svelte';
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		activity: Activity | null;
		onDismiss?: () => void;
		width?: number;
		dismissLabel?: string;
		label?: string;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let { activity, onDismiss, width = 300, dismissLabel = 'Dismiss activity', label = 'Activity', class: className, ...rest }: Props = $props();
	let hovered = $state(false);
	let focused = $state(false);
	let peeking = $state(false);
	let spoken = $state('');
	let peekTimer: ReturnType<typeof setTimeout> | undefined;
	let lastAnnounced = '';

	const phase = $derived(activity?.phase ?? 'running');
	const expanded = $derived(activity !== null && (hovered || focused || peeking || phase === 'error'));
	const percent = $derived(activity?.progress == null ? null : Math.round(Math.min(1, Math.max(0, activity.progress)) * 100));

	$effect(() => {
		if (!activity) {
			peeking = false;
			return;
		}
		peeking = true;
		if (peekTimer) clearTimeout(peekTimer);
		peekTimer = setTimeout(() => (peeking = false), 2600);
		const key = `${activity.id}:${activity.phase}`;
		if (key !== lastAnnounced) {
			lastAnnounced = key;
			spoken = activity.phase === 'running' ? `${activity.title} started.` : activity.phase === 'success' ? `${activity.title} finished.` : `${activity.title} failed.`;
		}
		return () => { if (peekTimer) clearTimeout(peekTimer); };
	});

	function enter() { hovered = true; }
	function leave() { hovered = false; }
</script>

<div {...rest} role="region" aria-label={label} class="pointer-events-none flex justify-center {className ?? ''}">
	{#if activity}
		<div
			class="pointer-events-auto relative overflow-hidden rounded-[11px] border border-stone-200 bg-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(28,25,23,0.07),0_16px_36px_-18px_rgba(28,25,23,0.5)] transition-[width,height,opacity,transform,filter] duration-300 dark:border-white/[0.16] dark:bg-[#252522] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_12px_rgba(0,0,0,0.55)]"
			style:width={`${expanded ? width : 'max-content'}`}
			style:min-height="32px"
			style:transform={peeking ? 'translateY(0) scale(1)' : 'translateY(0) scale(1)'}
			onpointerenter={enter}
			onpointerleave={leave}
			onfocusin={() => (focused = true)}
			onfocusout={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focused = false; }}
			onkeydown={(event) => {
				if (event.key !== 'Escape') return;
				event.preventDefault();
				if (phase === 'running') hovered = false;
				else onDismiss?.();
			}}
		>
			<div aria-hidden={expanded} inert={expanded} class="absolute top-0 left-0 flex h-8 w-max items-center gap-1.5 px-2.5 transition-[opacity,filter] duration-200" style:opacity={expanded ? 0 : 1} style:filter={expanded ? 'blur(3px)' : 'blur(0)'}>
				{#if phase === 'running'}<svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true" class:animate-spin={!reducedMotion.current}><circle cx="6" cy="6" r="4.4" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.25" /><path d="M6 1.6a4.4 4.4 0 0 1 4.4 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" /></svg>{:else if phase === 'success'}<span class="text-emerald-600 dark:text-emerald-400">✓</span>{:else}<span class="text-red-600 dark:text-red-400">!</span>{/if}
				{#if percent !== null && phase === 'running'}<span class="font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">{percent}%</span>{:else}<span class="max-w-[120px] truncate text-[12px] font-medium text-stone-700 dark:text-stone-200">{activity.title}</span>{/if}
			</div>

			<div aria-hidden={!expanded} inert={!expanded} class="px-3.5 py-3 transition-[opacity,filter] duration-200" style:width={`${width}px`} style:opacity={expanded ? 1 : 0} style:filter={expanded ? 'blur(0)' : 'blur(3px)'}>
				<div class="flex items-center gap-2">
					<span class="grid size-[18px] shrink-0 place-items-center">{#if phase === 'running'}<svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true" class:animate-spin={!reducedMotion.current}><circle cx="6" cy="6" r="4.4" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.25" /><path d="M6 1.6a4.4 4.4 0 0 1 4.4 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" /></svg>{:else if phase === 'success'}<span class="text-emerald-600 dark:text-emerald-400">✓</span>{:else}<span class="text-red-600 dark:text-red-400">!</span>{/if}</span>
					<span class="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-700 dark:text-stone-100">{activity.title}</span>
					{#if activity.action}<button type="button" tabindex={expanded ? 0 : -1} onclick={activity.action.onClick} class="inline-flex h-[24px] shrink-0 select-none items-center whitespace-nowrap rounded-[6px] border border-stone-200 bg-white px-2 text-[11px] font-medium text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-colors duration-150 hover:bg-stone-50 focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#2A2A27] dark:text-stone-100 dark:hover:bg-[#32322E]">{activity.action.label}</button>{/if}
					{#if onDismiss && phase !== 'running'}<button type="button" tabindex={expanded ? 0 : -1} aria-label={dismissLabel} onclick={onDismiss} class="grid size-[22px] shrink-0 place-items-center rounded-[6px] text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none dark:hover:bg-white/10 dark:hover:text-stone-100"><svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.8 2.8l6.4 6.4M9.2 2.8l-6.4 6.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /></svg></button>{/if}
				</div>
				{#if activity.detail}<p class="mt-1 truncate pl-[26px] text-[11.5px] text-stone-500 dark:text-stone-400">{activity.detail}</p>{/if}
				{#if percent !== null && phase !== 'error'}<div class="mt-2.5 flex items-center gap-2 pl-[26px]"><div class="min-w-0 flex-1 rounded-[4px] bg-stone-200/60 p-[2px] dark:bg-[#1D1D1A]"><div class="relative h-[4px] overflow-hidden rounded-[2px]"><motion.span aria-hidden="true" class="absolute inset-0 block origin-left rounded-[2px] bg-[#4568FF] dark:bg-[#93B0FF]" initial={false} animate={{ scaleX: (percent ?? 0) / 100 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 210, damping: 34, mass: 0.9 }} /></div></div><span class="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">{percent}%</span></div>{/if}
			</div>
		</div>
	{/if}
	<span role="status" aria-live="polite" class="sr-only">{spoken}</span>
</div>
