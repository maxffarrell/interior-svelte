<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type TreeNode = { id: string; label: string; meta?: string; children?: TreeNode[] };
	export type TreeRow = {
		node: TreeNode;
		level: number;
		parentId: string | null;
		posinset: number;
		setsize: number;
		branch: boolean;
		open: boolean;
	};
	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		nodes: TreeNode[];
		label: string;
		expanded?: string[];
		defaultExpanded?: string[];
		onExpandedChange?: (expanded: string[]) => void;
		selected?: string | null;
		defaultSelected?: string | null;
		onSelectedChange?: (selected: string) => void;
	};

	export function flattenTree(
		nodes: TreeNode[],
		openSet: ReadonlySet<string>,
		level = 1,
		parentId: string | null = null,
		out: TreeRow[] = []
	): TreeRow[] {
		nodes.forEach((node, index) => {
			const children = node.children ?? [];
			const branch = children.length > 0;
			const open = branch && openSet.has(node.id);
			out.push({ node, level, parentId, posinset: index + 1, setsize: nodes.length, branch, open });
			if (open) flattenTree(children, openSet, level + 1, node.id, out);
		});
		return out;
	}
</script>

<script lang="ts">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		nodes,
		label,
		expanded,
		defaultExpanded = [],
		onExpandedChange,
		selected,
		defaultSelected = null,
		onSelectedChange,
		class: className,
		...rest
	}: Props = $props();

	let internalOpen = $state([...defaultExpanded]);
	let internalSelected = $state<string | null>(defaultSelected);
	let focusId = $state<string | null>(null);
	let refs = $state<Record<string, HTMLElement | undefined>>({});
	const openList = $derived(expanded ?? internalOpen);
	const selectedId = $derived(selected === undefined ? internalSelected : selected);
	const openSet = $derived(new Set(openList));
	const rows = $derived(flattenTree(nodes, openSet));
	const tabStop = $derived(
		focusId && rows.some((row) => row.node.id === focusId)
			? focusId
			: rows.find((row) => row.node.id === selectedId)?.node.id ?? rows[0]?.node.id ?? null
	);
	const hintId = $props.id();

	function toggle(id: string) {
		const next = openList.includes(id) ? openList.filter((value) => value !== id) : [...openList, id];
		if (expanded === undefined) internalOpen = next;
		onExpandedChange?.(next);
	}

	function select(id: string) {
		if (selected === undefined) internalSelected = id;
		onSelectedChange?.(id);
	}

	function focusRow(id: string) {
		focusId = id;
		refs[id]?.focus();
	}

	function go(rowsToUse: TreeRow[], index: number) {
		const row = rowsToUse[index];
		if (row) focusRow(row.node.id);
	}

	function handleKey(event: KeyboardEvent, row: TreeRow) {
		const at = rows.findIndex((item) => item.node.id === row.node.id);
		switch (event.key) {
			case 'ArrowDown': event.preventDefault(); go(rows, at + 1); return;
			case 'ArrowUp': event.preventDefault(); go(rows, at - 1); return;
			case 'ArrowRight':
				event.preventDefault();
				if (row.branch && !row.open) toggle(row.node.id);
				else if (row.open) go(rows, at + 1);
				return;
			case 'ArrowLeft':
				event.preventDefault();
				if (row.open) toggle(row.node.id);
				else if (row.parentId) focusRow(row.parentId);
				return;
			case 'Home': event.preventDefault(); go(rows, 0); return;
			case 'End': event.preventDefault(); go(rows, rows.length - 1); return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				select(row.node.id);
				if (row.branch) toggle(row.node.id);
				return;
		}

		if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
			const letter = event.key.toLowerCase();
			if (letter === ' ') return;
			for (let step = 1; step <= rows.length; step += 1) {
				const candidate = rows[(at + step) % rows.length];
				if (candidate.node.label.toLowerCase().startsWith(letter)) {
					event.preventDefault();
					focusRow(candidate.node.id);
					return;
				}
			}
		}
	}
</script>

{#snippet renderNodes(list: TreeNode[], level: number)}
	{#each list as node, index (node.id)}
		{@const row = rows.find((item) => item.node.id === node.id)}
		{#if row}
			<li role="none">
				<div
					role="treeitem"
					bind:this={refs[node.id]}
					aria-level={level}
					aria-posinset={index + 1}
					aria-setsize={list.length}
					aria-expanded={row.branch ? row.open : undefined}
					aria-selected={selectedId === node.id}
					aria-describedby={hintId}
					tabindex={tabStop === node.id ? 0 : -1}
					onfocus={() => (focusId = node.id)}
					onkeydown={(event) => handleKey(event, row)}
					onclick={() => { select(node.id); focusRow(node.id); if (row.branch) toggle(node.id); }}
					class="flex h-7 cursor-default select-none items-center gap-1 rounded-[8px] px-1.5 text-stone-600 outline-none transition-colors duration-150 hover:bg-stone-100/60 focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:text-stone-300 dark:hover:bg-white/[0.04] dark:focus-visible:bg-[#93B0FF]/[0.1] dark:focus-visible:shadow-[inset_0_0_0_1px_#93B0FF] {selectedId === node.id ? 'bg-stone-100/80 font-medium text-stone-800 dark:bg-white/[0.07] dark:text-stone-100' : ''}"
				>
					{#if row.branch}
						<span aria-hidden="true" class="flex size-4 shrink-0 items-center justify-center text-stone-400 transition-transform duration-200 dark:text-stone-500" class:rotate-90={row.open}>
							<svg viewBox="0 0 12 12" width="10" height="10" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
						</span>
					{:else}<span class="size-4 shrink-0"></span>{/if}
					<span class="min-w-0 flex-1 truncate text-[12.5px]">{node.label}</span>
					{#if node.meta}<span class="shrink-0 font-mono text-[10.5px] tabular-nums text-stone-400 dark:text-stone-500">{node.meta}</span>{/if}
				</div>

				{#if row.branch}
					<ul
						role="group"
						aria-hidden={!row.open}
						inert={!row.open}
						class="grid overflow-hidden transition-[grid-template-rows,opacity]"
						style:grid-template-rows={row.open ? '1fr' : '0fr'}
						style:opacity={row.open ? '1' : '0'}
						style:transition-duration={reducedMotion.current ? '0ms' : row.open ? '280ms' : '200ms'}
					>
						<li class="min-h-0 overflow-hidden">
							<div class="ml-[13px] border-l border-stone-200/80 pl-[7px] dark:border-white/[0.16]">
								{@render renderNodes(node.children ?? [], level + 1)}
							</div>
						</li>
					</ul>
				{/if}
			</li>
		{/if}
	{/each}
{/snippet}

<div class="rounded-[13px] border border-stone-200 bg-white p-[5px] shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}" {...rest}>
	<ul role="tree" aria-label={label}>{@render renderNodes(nodes, 1)}</ul>
	<span id={hintId} class="sr-only">Use the arrow keys to move. Right expands a folder, left collapses it or climbs to its parent. Home and End jump to the ends, and typing a letter jumps to the next name starting with it.</span>
</div>
