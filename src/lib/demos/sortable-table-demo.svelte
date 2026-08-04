<script lang="ts">
	import SortableTable, { type SortableColumn } from '#lib/components/interior/sortable-table.svelte';
	type Reviewer = { id: string; name: string; open: number; seen: string; ago: number };
	const reviewers: Reviewer[] = [{ id: 'r1', name: 'Priya Raman', open: 12, seen: '2h ago', ago: 120 }, { id: 'r2', name: 'Marco Silva', open: 3, seen: '1d ago', ago: 1440 }, { id: 'r3', name: 'Ada Okonjo', open: 21, seen: '18m ago', ago: 18 }, { id: 'r4', name: 'Tom Beckett', open: 7, seen: '4d ago', ago: 5760 }, { id: 'r5', name: 'Lena Fischer', open: 15, seen: '6h ago', ago: 360 }, { id: 'r6', name: 'Noah Kim', open: 1, seen: '9h ago', ago: 540 }];
	const columns: SortableColumn<Reviewer>[] = [{ id: 'name', header: 'Reviewer', value: (row) => row.name }, { id: 'open', header: 'Open', width: '72px', align: 'end', numeric: true, value: (row) => row.open }, { id: 'seen', header: 'Last seen', width: '96px', align: 'end', value: (row) => row.ago, cell: (row) => row.seen }];
</script>

<div class="mx-auto w-full max-w-[440px]"><SortableTable label="Reviewers" rows={reviewers} {columns} getRowId={(row) => row.id} getRowLabel={(row) => row.name} markable /></div>
