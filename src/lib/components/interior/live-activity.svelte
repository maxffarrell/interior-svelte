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
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import type { ActivityPhase } from './live-activity.state.svelte';

	const SURFACE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const SMALL = { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 } as const;
	const FILL = { type: 'spring', stiffness: 210, damping: 34, mass: 0.9 } as const;
	const EASE = [0.23, 1, 0.32, 1] as const;
	const LEAVE = [0.4, 0, 1, 1] as const;
	const DRAW = { duration: 0.3, ease: EASE } as const;
	const INSTANT = { duration: 0 } as const;
	const SPIN = { duration: 0.85, ease: 'linear', repeat: Infinity } as const;
	const PEEK_FOR = 2600;
	const LEAVE_DELAY = 160;

	let {
		activity,
		onDismiss,
		width = 300,
		dismissLabel = 'Dismiss activity',
		label = 'Activity',
		class: className,
		...rest
	}: Props = $props();

	let hovered = $state(false);
	let focused = $state(false);
	let peeking = $state(false);
	let spoken = $state('');
	let compact: any = $state(null);
	let expandedFace: any = $state(null);
	let dimensions: { width: number; height: number } | null = $state(null);
	let sizes = { compact: { width: 0, height: 0 }, expanded: { width: 0, height: 0 } };
	let leaveTimer: ReturnType<typeof setTimeout> | undefined;
	let peekTimer: ReturnType<typeof setTimeout> | undefined;
	const announced = new Set<string>();

	const phase = $derived(activity?.phase ?? 'running');
	const expanded = $derived(activity !== null && (hovered || focused || peeking || phase === 'error'));
	const percent = $derived(
		activity?.progress == null
			? null
			: Math.round(Math.min(1, Math.max(0, activity.progress)) * 100)
	);

	function applySize(open: boolean) {
		const target = open ? sizes.expanded : sizes.compact;
		if (target.width === 0 || target.height === 0) return;
		if (
			dimensions &&
			Math.abs(dimensions.width - target.width) < 0.5 &&
			Math.abs(dimensions.height - target.height) < 0.5
		) return;
		dimensions = { ...target };
	}

	$effect(() => {
		if (!activity) return;
		const open = expanded;
		const compactElement = compact;
		const expandedElement = expandedFace;
		const read = () => {
			if (compactElement) {
				sizes.compact = {
					width: compactElement.offsetWidth,
					height: compactElement.offsetHeight
				};
			}
			if (expandedElement) {
				sizes.expanded = {
					width: expandedElement.offsetWidth,
					height: expandedElement.offsetHeight
				};
			}
			applySize(open);
		};
		read();
		if (typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(read);
		if (compactElement) observer.observe(compactElement);
		if (expandedElement) observer.observe(expandedElement);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!activity) {
			peeking = false;
			hovered = false;
			focused = false;
			dimensions = null;
			return;
		}

		peeking = true;
		if (peekTimer) clearTimeout(peekTimer);
		peekTimer = setTimeout(() => {
			peekTimer = undefined;
			peeking = false;
		}, PEEK_FOR);

		const key = `${activity.id}:${activity.phase}`;
		if (!announced.has(key)) {
			if (announced.size > 64) announced.clear();
			announced.add(key);
			spoken =
				activity.phase === 'running'
					? `${activity.title} started.`
					: activity.phase === 'success'
						? `${activity.title} finished.`
						: `${activity.title} failed.`;
		}

		return () => {
			if (peekTimer) clearTimeout(peekTimer);
		};
	});

	$effect(() => () => {
		if (leaveTimer) clearTimeout(leaveTimer);
		if (peekTimer) clearTimeout(peekTimer);
	});

	function enter() {
		if (leaveTimer) clearTimeout(leaveTimer);
		leaveTimer = undefined;
		hovered = true;
	}

	function leave() {
		if (leaveTimer) clearTimeout(leaveTimer);
		leaveTimer = setTimeout(() => {
			leaveTimer = undefined;
			hovered = false;
		}, LEAVE_DELAY);
	}
</script>

{#snippet phaseGlyph(glyphPhase: ActivityPhase)}
	<span class="grid size-[18px] shrink-0 place-items-center">
		<motion.span
			class="col-start-1 row-start-1 flex"
			initial={false}
			animate={{
				opacity: glyphPhase === 'running' ? 1 : 0,
				scale: reducedMotion.current ? 1 : glyphPhase === 'running' ? 1 : 0.7
			}}
			transition={reducedMotion.current ? INSTANT : SMALL}
		>
			{#if reducedMotion.current}
				<svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
					<circle cx="6" cy="6" r="4.4" stroke="currentColor" stroke-width="1.6" fill="none" class="text-stone-400 dark:text-stone-500" opacity="0.4" />
				</svg>
			{:else}
				<motion.svg
					width="13"
					height="13"
					viewBox="0 0 12 12"
					style={{ transformOrigin: '50% 50%' }}
					animate={{ rotate: 360 }}
					transition={SPIN}
					class="text-[#4568FF] dark:text-[#93B0FF]"
				>
					<circle cx="6" cy="6" r="4.4" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.25" />
					<path d="M6 1.6a4.4 4.4 0 0 1 4.4 4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
				</motion.svg>
			{/if}
		</motion.span>
		<motion.span
			class="col-start-1 row-start-1 flex text-emerald-600 dark:text-emerald-400"
			initial={false}
			animate={{
				opacity: glyphPhase === 'success' ? 1 : 0,
				scale: reducedMotion.current ? 1 : glyphPhase === 'success' ? 1 : 0.7
			}}
			transition={reducedMotion.current ? INSTANT : SMALL}
		>
			<svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
				<motion.path
					d="M2.4 6.4 4.8 8.8 9.6 3.4"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
					initial={false}
					animate={{ pathLength: glyphPhase === 'success' ? 1 : 0 }}
					transition={reducedMotion.current ? INSTANT : DRAW}
				/>
			</svg>
		</motion.span>
		<motion.span
			class="col-start-1 row-start-1 flex text-red-600 dark:text-red-400"
			initial={false}
			animate={{
				opacity: glyphPhase === 'error' ? 1 : 0,
				scale: reducedMotion.current ? 1 : glyphPhase === 'error' ? 1 : 0.7
			}}
			transition={reducedMotion.current ? INSTANT : SMALL}
		>
			<svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
				<path d="M6 2.6v3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
				<rect x="5.2" y="8.2" width="1.6" height="1.6" rx="0.4" fill="currentColor" />
			</svg>
		</motion.span>
	</span>
{/snippet}

<div {...rest} role="region" aria-label={label} class="pointer-events-none flex justify-center {className ?? ''}">
	<AnimatePresence initial={false}>
		{#if activity}
			<motion.div
				initial={reducedMotion.current
					? { opacity: 0 }
					: { opacity: 0, y: -10, scale: 0.9, filter: 'blur(6px)' }}
				animate={{
					opacity: 1,
					y: 0,
					scale: 1,
					filter: 'blur(0px)',
					width: dimensions?.width,
					height: dimensions?.height
				}}
				exit={reducedMotion.current
					? { opacity: 0, transition: INSTANT }
					: {
							opacity: 0,
							y: -8,
							scale: 0.97,
							filter: 'blur(3px)',
							transition: { duration: 0.16, ease: LEAVE }
						}}
				transition={reducedMotion.current
					? INSTANT
					: {
							...SURFACE,
							opacity: { duration: 0.2, ease: EASE },
							filter: { duration: 0.2, ease: EASE }
						}}
				style={{ transformOrigin: '50% 0%' }}
				onpointerenter={enter}
				onpointerleave={leave}
				onfocusin={() => (focused = true)}
				onfocusout={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget as Node | null)) focused = false;
				}}
				onkeydown={(event) => {
					if (event.key !== 'Escape') return;
					event.preventDefault();
					if (phase === 'running') hovered = false;
					else onDismiss?.();
				}}
				class="pointer-events-auto relative overflow-hidden rounded-[11px] border border-stone-200 bg-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),0_1px_2px_rgba(28,25,23,0.07),0_16px_36px_-18px_rgba(28,25,23,0.5)] dark:border-white/[0.16] dark:bg-[#252522] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_2px_12px_rgba(0,0,0,0.55)]"
			>
				<motion.div
					aria-hidden={expanded}
					inert={expanded}
					initial={false}
					animate={{ opacity: expanded ? 0 : 1 }}
					transition={reducedMotion.current ? INSTANT : CROSSFADE}
					class="absolute top-0 left-0 {expanded ? 'pointer-events-none' : ''}"
				>
					<div bind:this={compact} class="flex h-8 w-max items-center gap-1.5 px-2.5">
						{@render phaseGlyph(phase)}
						{#if percent !== null && phase === 'running'}
							<span class="font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">{percent}%</span>
						{:else}
							<span class="max-w-[120px] truncate text-[12px] font-medium text-stone-700 dark:text-stone-200">{activity.title}</span>
						{/if}
					</div>
				</motion.div>

				<motion.div
					aria-hidden={!expanded}
					inert={!expanded}
					initial={false}
					animate={{ opacity: expanded ? 1 : 0 }}
					transition={reducedMotion.current ? INSTANT : CROSSFADE}
					class="absolute top-0 left-0 {!expanded ? 'pointer-events-none' : ''}"
				>
					<div bind:this={expandedFace} style:width={`${width}px`} class="px-3.5 py-3">
					<div class="flex items-center gap-2">
						{@render phaseGlyph(phase)}
						<span class="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-700 dark:text-stone-100">{activity.title}</span>
						{#if activity.action}
							<button
								type="button"
								tabindex={expanded ? 0 : -1}
								onclick={activity.action.onClick}
								class="inline-flex h-[24px] shrink-0 select-none items-center whitespace-nowrap rounded-[6px] border border-stone-200 bg-white px-2 text-[11px] font-medium text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-[background-color,border-color,box-shadow] duration-150 hover:bg-stone-50 focus-visible:border-[#4568FF] active:translate-y-px dark:border-white/[0.16] dark:bg-[#2A2A27] dark:text-stone-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_1px_2px_rgba(0,0,0,0.4)] dark:hover:bg-[#32322E] dark:focus-visible:border-[#93B0FF]"
							>
								{activity.action.label}
							</button>
						{/if}
						{#if onDismiss && phase !== 'running'}
							<button
								type="button"
								tabindex={expanded ? 0 : -1}
								aria-label={dismissLabel}
								onclick={onDismiss}
								class="grid size-[22px] shrink-0 place-items-center rounded-[6px] text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] focus-visible:outline-none dark:text-stone-500 dark:hover:bg-white/10 dark:hover:text-stone-100 dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF]"
							>
								<svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
									<path d="M2.8 2.8l6.4 6.4M9.2 2.8l-6.4 6.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
								</svg>
							</button>
						{/if}
					</div>

					{#if activity.detail}
						<p class="mt-1 truncate pl-[26px] text-[11.5px] text-stone-500 dark:text-stone-400">{activity.detail}</p>
					{/if}

					{#if percent !== null && phase !== 'error'}
						<div class="mt-2.5 flex items-center gap-2 pl-[26px]">
							<div class="min-w-0 flex-1 rounded-[4px] bg-stone-200/60 p-[2px] shadow-[inset_0_1px_2px_rgba(28,25,23,0.1)] dark:bg-[#1D1D1A] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]">
								<div class="relative h-[4px] overflow-hidden rounded-[2px]">
									<motion.span
										aria-hidden="true"
										class="absolute inset-0 block origin-left rounded-[2px] bg-[#4568FF] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] dark:bg-[#93B0FF]"
										initial={false}
										animate={{ scaleX: (percent ?? 0) / 100 }}
										transition={reducedMotion.current ? INSTANT : FILL}
									/>
								</div>
							</div>
							<span class="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-500 dark:text-stone-400">{percent}%</span>
						</div>
					{/if}
					</div>
				</motion.div>
			</motion.div>
		{/if}
	</AnimatePresence>
	<span role="status" aria-live="polite" class="sr-only">{spoken}</span>
</div>
