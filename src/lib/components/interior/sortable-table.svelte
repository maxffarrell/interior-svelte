<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type SortDirection = 'asc' | 'desc';
	export type SortState = { columnId: string; direction: SortDirection };
	export type SortableColumn<T> = {
		id: string;
		header: string;
		width?: string;
		align?: 'start' | 'end';
		numeric?: boolean;
		sortable?: boolean;
		value?: (row: T) => string | number | null | undefined;
		cell?: (row: T) => string | number | null | undefined;
	};
	export type OrderedRow<T> = { id: string; row: T; index: number };
	export type Props<T> = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		rows: T[];
		columns: SortableColumn<T>[];
		getRowId: (row: T) => string;
		label: string;
		rowHeight?: number;
		maxHeight?: number;
		sort?: SortState | null;
		defaultSort?: SortState | null;
		onSortChange?: (next: SortState | null) => void;
		markable?: boolean;
		onMarkChange?: (id: string | null) => void;
		getRowLabel?: (row: T) => string;
	};

	export function sortRows<T>(rows: T[], columns: SortableColumn<T>[], getRowId: (row: T) => string, sort: SortState | null): OrderedRow<T>[] {
		const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
		const base = rows.map((row, i) => ({ row, i, id: getRowId(row) }));
		const column = columns.find((item) => item.id === sort?.columnId);
		if (sort && column?.value) {
			const dir = sort.direction === 'asc' ? 1 : -1;
			base.sort((a, b) => {
				const left = column.value?.(a.row);
				const right = column.value?.(b.row);
				const emptyLeft = left === null || left === undefined || left === '';
				const emptyRight = right === null || right === undefined || right === '';
				if (emptyLeft || emptyRight) {
					if (emptyLeft && emptyRight) return a.i - b.i;
					return emptyLeft ? 1 : -1;
				}
				const difference = typeof left === 'number' && typeof right === 'number' ? left - right : collator.compare(String(left), String(right));
				return difference === 0 ? a.i - b.i : difference * dir;
			});
		}
		return base.map(({ id, row }, index) => ({ id, row, index }));
	}
</script>

<script lang="ts" generics="T">
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		rows,
		columns,
		getRowId,
		label,
		rowHeight = 44,
		maxHeight,
		sort = $bindable<SortState | null | undefined>(undefined),
		defaultSort = null,
		onSortChange,
		markable = false,
		onMarkChange,
		getRowLabel,
		class: className,
		...rest
	}: Props<T> = $props();

	let internalSort = $state<SortState | null>(defaultSort);
	let marked = $state<string | null>(null);
	let touched = $state(false);
	let moving = $state(false);
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	const current = $derived(sort === undefined ? internalSort : sort);
	const ordered = $derived(sortRows(rows, columns, getRowId, current));
	const template = $derived((markable ? '28px ' : '') + columns.map((column) => column.width ?? 'minmax(0, 1fr)').join(' '));
	const message = $derived.by(() => {
		if (!touched) return '';
		const header = columns.find((column) => column.id === current?.columnId)?.header;
		return current && header ? `Sorted by ${header}, ${current.direction === 'asc' ? 'ascending' : 'descending'}. ${rows.length} rows.` : `Original order restored. ${rows.length} rows.`;
	});

	function ariaSort(id: string) {
		if (current?.columnId !== id) return 'none';
		return current.direction === 'asc' ? 'ascending' : 'descending';
	}

	function toggle(columnId: string) {
		const column = columns.find((item) => item.id === columnId);
		if (column?.sortable === false) return;
		const next: SortState | null = !current || current.columnId !== columnId
			? { columnId, direction: 'asc' }
			: current.direction === 'asc' ? { columnId, direction: 'desc' } : null;
		if (sort === undefined) internalSort = next;
		sort = next;
		touched = true;
		onSortChange?.(next);
		if (reducedMotion.current) return;
		moving = true;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(() => (moving = false), 380);
	}

	function mark(id: string) {
		marked = marked === id ? null : id;
		onMarkChange?.(marked);
	}
</script>

<div class="overflow-hidden rounded-[14px] border border-stone-200 bg-white shadow-[0_1px_2px_rgba(28,25,23,0.06),0_4px_10px_-8px_rgba(28,25,23,0.45)] dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:shadow-[0_1px_6px_rgba(0,0,0,0.45)] {className ?? ''}" {...rest}>
	<div role="table" aria-label={label} aria-rowcount={rows.length + 1} aria-colcount={columns.length + (markable ? 1 : 0)}>
		<div role="rowgroup">
			<div role="row" aria-rowindex="1" class="grid h-9 items-center gap-x-2 border-b border-stone-200 px-2 dark:border-white/[0.16]" style={`grid-template-columns:${template}`}>
				{#if markable}<div role="columnheader"><span class="sr-only">Follow</span></div>{/if}
				{#each columns as column (column.id)}
					{@const state = ariaSort(column.id)}
					{@const active = state !== 'none'}
					<div role="columnheader" class="min-w-0" aria-sort={column.sortable === false ? undefined : state}>
						{#if column.sortable === false}
							<span class="block truncate px-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400 {column.align === 'end' ? 'text-right' : ''}">{column.header}</span>
						{:else}
							<button type="button" onclick={() => toggle(column.id)} class="group flex h-7 w-full items-center gap-1.5 rounded-[6px] px-1.5 outline-none focus-visible:bg-[#4568FF]/[0.06] focus-visible:shadow-[inset_0_0_0_1px_#4568FF] {column.align === 'end' ? 'flex-row-reverse' : ''}">
								<span class="truncate text-[11px] font-semibold uppercase tracking-[0.08em] {active ? 'text-stone-700 dark:text-stone-200' : 'text-stone-500 group-hover:text-stone-700 dark:text-stone-400 dark:group-hover:text-stone-200'}">{column.header}</span>
								<span aria-hidden="true" class="shrink-0 text-stone-700 transition-[opacity,transform] duration-200 dark:text-stone-200 {active ? 'scale-100 opacity-100' : 'scale-[0.72] opacity-0'}" class:rotate-180={state === 'descending'}><svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M5 8.6V1.6M5 1.6 2.2 4.4M5 1.6l2.8 2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
							</button>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		<div role="rowgroup" class="relative overflow-y-auto overscroll-contain" style={`height:${Math.max(1, rows.length) * rowHeight}px`} style:max-height={maxHeight ? `${maxHeight}px` : undefined}>
			{#if rows.length === 0}<div role="row" class="absolute inset-x-0 top-0 flex items-center px-3.5" style:height={`${rowHeight}px`}><span role="cell" class="text-[12.5px] text-stone-500 dark:text-stone-400">No rows</span></div>{/if}
			{#each ordered as item, index (item.id)}
				{@const markedRow = markable && marked === item.id}
				<div role="row" aria-rowindex={index + 2} aria-current={markedRow ? 'true' : undefined} class="absolute inset-x-0 top-0 grid items-center gap-x-2 px-2 transition-colors duration-150 {markedRow ? 'bg-stone-100 dark:bg-white/[0.06]' : ''}" style={`height:${rowHeight}px;grid-template-columns:${template};transform:translateY(${index * rowHeight}px);transition:transform ${reducedMotion.current ? '0ms' : '520ms cubic-bezier(0.23, 1, 0.32, 1)'} ${Math.min(index, 8) * 18}ms`}>
					{#if markable}<div role="cell"><button type="button" aria-pressed={markedRow} onclick={() => mark(item.id)} class="flex size-[18px] items-center justify-center rounded-[5px] border outline-none focus-visible:border-[#4568FF] {markedRow ? 'border-[#4568FF] bg-[#4568FF] text-white' : 'border-stone-200 text-transparent dark:border-white/15'}"><span class="sr-only">Follow {getRowLabel?.(item.row) ?? String(columns[0]?.value?.(item.row) ?? item.id)}</span><svg aria-hidden="true" width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2.6 6.3 4.9 8.6 9.4 3.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg></button></div>{/if}
					{#each columns as column, columnIndex (column.id)}
						{@const raw = column.value?.(item.row)}
						{@const content = column.cell ? column.cell(item.row) : raw === null || raw === undefined || raw === '' ? '—' : String(raw)}
						<div role="cell" class="min-w-0 truncate px-1.5 text-[13px] {column.align === 'end' ? 'text-right' : ''} {column.numeric ? 'tabular-nums' : ''} {columnIndex === 0 ? 'font-medium text-stone-700 dark:text-stone-200' : 'text-stone-500 dark:text-stone-400'}">{content}</div>
					{/each}
				</div>
			{/each}
			<div aria-hidden="true" class="pointer-events-none absolute inset-0 transition-opacity" style:opacity={moving ? '0' : '1'} style:transition={moving ? 'opacity 120ms cubic-bezier(0.4, 0, 1, 1)' : 'opacity 250ms cubic-bezier(0.23, 1, 0.32, 1)'}>
				{#each Array.from({ length: Math.max(0, rows.length - 1) }) as _, i (i)}<div class="absolute inset-x-0 border-t border-stone-200 dark:border-white/[0.16]" style:top={`${(i + 1) * rowHeight}px`}></div>{/each}
			</div>
		</div>
	</div>
	<div role="status" aria-live="polite" class="sr-only">{message}</div>
</div>

<svelte:window onbeforeunload={() => clearTimeout(settleTimer)} />
