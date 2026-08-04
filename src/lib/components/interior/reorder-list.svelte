<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	export type Props<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items: readonly T[];
		getId: (item: T) => string;
		getLabel: (item: T) => string;
		onReorder: (next: T[]) => void;
		onCommit?: (next: T[]) => void;
		children: Snippet<[T]>;
		label: string;
		disabled?: boolean;
	};
</script>

<script lang="ts" generics="T">
	import { flip } from 'svelte/animate';
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';

	let { items, getId, getLabel, onReorder, onCommit, children, label, disabled = false, class: className, ...rest }: Props<T> = $props();
	let grabbed = $state<string | null>(null);
	let dragging = $state<string | null>(null);
	let spoken = $state('');
	let snapshot: readonly T[] | null = null;
	let pointerId: number | null = null;

	function indexOf(id: string) { return items.findIndex((item) => getId(item) === id); }
	function move(from: number, to: number) {
		if (from < 0 || to < 0 || to >= items.length) return;
		const next = [...items];
		const [item] = next.splice(from, 1);
		next.splice(to, 0, item);
		onReorder(next);
		spoken = `${getLabel(item)}, position ${to + 1} of ${next.length}.`;
		if (!snapshot) onCommit?.(next);
	}
	function grab(id: string) { snapshot = items; grabbed = id; const at = indexOf(id); spoken = `${getLabel(items[at])} grabbed, position ${at + 1} of ${items.length}.`; }
	function drop(id: string) { snapshot = null; grabbed = null; const at = indexOf(id); spoken = `${getLabel(items[at])} dropped at position ${at + 1}.`; onCommit?.([...items]); }
	function cancel() { if (snapshot) onReorder([...snapshot]); snapshot = null; grabbed = null; dragging = null; spoken = 'Reorder cancelled, original order restored.'; }
	function keydown(event: KeyboardEvent, id: string) {
		if (disabled || event.target !== event.currentTarget) return;
		const held = grabbed === id;
		if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); held ? drop(id) : grab(id); }
		else if (held && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) { event.preventDefault(); move(indexOf(id), indexOf(id) + (event.key === 'ArrowUp' ? -1 : 1)); }
		else if (held && event.key === 'Escape') { event.preventDefault(); cancel(); }
	}
	function pointerdown(event: PointerEvent & { currentTarget: EventTarget & HTMLElement }, id: string) {
		if (disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		pointerId = event.pointerId;
		dragging = id;
		snapshot = items;
	}
	function pointermove(event: PointerEvent, id: string) {
		if (pointerId !== event.pointerId || dragging !== id) return;
		const from = indexOf(id);
		const target = [...document.querySelectorAll<HTMLElement>('[data-reorder-id]')].findIndex((node) => {
			const rect = node.getBoundingClientRect();
			return event.clientY < rect.top + rect.height / 2;
		});
		const to = target < 0 ? items.length - 1 : target;
		if (to !== from) move(from, to);
	}
	function pointerup(event: PointerEvent, id: string) {
		if (pointerId !== event.pointerId) return;
		pointerId = null;
		dragging = null;
		const at = indexOf(id);
		const item = items[at];
		spoken = `${getLabel(item)} dropped at position ${at + 1}.`;
		snapshot = null;
		onCommit?.([...items]);
	}
</script>

<div {...rest} class={cn('w-full', className)}>
	<ul aria-label={label} class="m-0 list-none space-y-1.5 p-0">
		{#each items as item (getId(item))}
			{@const id = getId(item)}
			{@const held = grabbed === id}
			{@const lifted = held || dragging === id}
			<li data-reorder-id role="button" aria-describedby="reorder-list-hint" aria-pressed={held} tabindex={disabled ? -1 : 0} onkeydown={(event) => keydown(event, id)} onpointerdown={(event) => pointerdown(event, id)} onpointermove={(event) => pointermove(event, id)} onpointerup={(event) => pointerup(event, id)} onpointercancel={(event) => pointerup(event, id)} onblur={() => held && cancel()} animate:flip={{ duration: reducedMotion.current ? 0 : 200 }} class={cn('relative flex items-center gap-2.5 rounded-[9px] border bg-panel px-3 py-2.5 outline-none transition-[border-color,box-shadow,background-color] duration-150 focus-visible:border-accent', lifted ? 'z-10 cursor-grabbing shadow-[0_1px_2px_rgba(28,25,23,0.08),0_14px_28px_-16px_rgba(28,25,23,0.5)]' : 'cursor-grab border-hairline shadow-[0_1px_2px_rgba(28,25,23,0.06)]', held && 'border-accent bg-accent/4')} style="touch-action:pan-x">
				<span aria-hidden class={cn('shrink-0 text-[14px]', lifted ? 'text-ink-3' : 'text-ink-3/50')}>⠿</span>
				<span class="sr-only">{getLabel(item)}</span>
				<div aria-hidden class="min-w-0 flex-1">{@render children(item)}</div>
			</li>
		{/each}
	</ul>
	<span id="reorder-list-hint" class="sr-only">Drag to reorder. With the keyboard, Space grabs the row, the arrow keys move it, Space drops it, and Escape puts everything back.</span>
	<span role="status" aria-live="polite" class="sr-only">{spoken}</span>
</div>
