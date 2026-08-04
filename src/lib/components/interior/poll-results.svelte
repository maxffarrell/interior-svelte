<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	export type PollOption = { id: string; label: string; votes: number };
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		options: PollOption[];
		label: string;
		value?: string | null;
		defaultValue?: string | null;
		onVote?: (id: string) => void;
	};
</script>

<script lang="ts">
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	const FILL = { type: 'spring', stiffness: 210, damping: 34, mass: 0.9 } as const;
	const POP = { type: 'spring', stiffness: 640, damping: 22, mass: 0.7 } as const;
	const INSTANT = { duration: 0 } as const;
	let { options, label, value, defaultValue = null, onVote, class: className, ...rest }: Props = $props();
	let internal = $state<string | null>(defaultValue);
	let spoken = $state('');
	let landed = $state(false);
	const chosen = $derived(value === undefined ? internal : value);
	const total = $derived(options.reduce((sum, option) => sum + Math.max(0, option.votes), 0));
	const top = $derived(options.reduce((best, option) => Math.max(best, option.votes), 0));
	const revealed = $derived(chosen !== null);
	const rows = $derived(options.map((option) => ({ ...option, share: total > 0 ? Math.max(0, option.votes) / total : 0, winner: total > 0 && option.votes === top, mine: option.id === chosen })));

	function vote(id: string) {
		if (chosen !== null) return;
		if (value === undefined) internal = id;
		onVote?.(id);
	}

	$effect(() => {
		if (!revealed) return;
		landed = false;
		const timer = setTimeout(() => {
			landed = true;
			const winner = rows.find((row) => row.winner);
			spoken = winner ? `Results: ${winner.label} leads with ${Math.round(winner.share * 100)} percent of ${total} votes` : `Results shown, ${total} votes`;
		}, reducedMotion.current ? 0 : 700);
		return () => clearTimeout(timer);
	});
</script>

<div {...rest} role="group" aria-label={label} class={cn('w-full', className)}>
	<p class="mb-2.5 text-[13px] font-medium text-ink">{label}</p>
	<div class="space-y-1.5">
		{#each rows as row (row.id)}
			<button type="button" onclick={() => vote(row.id)} aria-disabled={revealed} aria-pressed={revealed ? row.mine : undefined} class={cn('group relative h-9 w-full overflow-hidden rounded-[8px] border text-left outline-none transition-[border-color,background-color,box-shadow,transform] duration-200 focus-visible:border-accent', revealed ? 'cursor-default border-hairline mat-well' : 'border-hairline bg-panel hover:bg-well active:translate-y-px')}>
				<motion.span aria-hidden initial={{ clipPath: 'inset(0 100% 0 0 round 5px)' }} animate={{ clipPath: `inset(0 ${(1 - (revealed ? row.share : 0)) * 100}% 0 0 round 5px)` }} transition={reducedMotion.current ? INSTANT : FILL} class={cn('absolute inset-[3px] rounded-[5px]', row.mine ? 'bg-accent/20' : 'bg-ink/10')} />
				<span class="relative flex h-full items-center gap-2 px-3">
					<span class={cn('min-w-0 flex-1 truncate text-[13px]', revealed && row.winner ? 'font-medium text-ink' : 'text-ink-2')}>{row.label}</span>
					<span class="grid size-4 shrink-0 place-items-center">{#if revealed && row.winner && landed}<motion.svg viewBox="0 0 256 256" fill="none" initial={{ opacity: 0, scale: reducedMotion.current ? 1 : 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={reducedMotion.current ? INSTANT : POP} class="size-3 text-ink"><polyline points="216 72 104 184 48 128" stroke="currentColor" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" /></motion.svg>{/if}</span>
					<span class="relative grid shrink-0 text-right"><span aria-hidden class="invisible col-start-1 row-start-1 font-mono text-[11px]">100%</span><motion.span aria-hidden animate={{ opacity: revealed ? 1 : 0 }} transition={reducedMotion.current ? INSTANT : FILL} class="col-start-1 row-start-1 font-mono text-[11px] tabular-nums text-ink-3">{Math.round((revealed ? row.share : 0) * 100)}%</motion.span></span>
				</span>
			</button>
		{/each}
	</div>
	<p class="mt-2 h-4 font-mono text-[10.5px] tabular-nums text-ink-3"><motion.span animate={{ opacity: revealed ? 1 : 0 }} transition={reducedMotion.current ? INSTANT : { duration: 0.2, delay: 0.4 }} class="inline-block">{total.toLocaleString('en-US')} votes</motion.span></p>
	<span role="status" class="sr-only">{spoken}</span>
</div>
