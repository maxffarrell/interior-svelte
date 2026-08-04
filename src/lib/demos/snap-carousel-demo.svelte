<script lang="ts">
	import SnapCarousel from '#lib/components/interior/snap-carousel.svelte';
	const rooms = [{ name: 'Atrium', line: 'North light, all afternoon' }, { name: 'Stair hall', line: 'Travertine, half a step out' }, { name: 'Kitchen', line: 'Oak run, brass where hands land' }, { name: 'Library', line: 'Iron shelves, no plastic in reach' }, { name: 'Terrace', line: 'Brick, best at dusk' }];
</script>

<div class="mx-auto w-full max-w-[440px]"><SnapCarousel label="Rooms" count={rooms.length} peek={48} gap={10}>
	{#snippet children(index)}<figure class="mat-panel rounded-[11px] p-[5px]"><div class="mat-well relative grid h-[104px] place-items-center rounded-[9px]"><div class="text-center"><p class="text-[15px] font-medium text-ink">{rooms[index].name}</p><p class="mt-1 text-[11.5px] text-ink-3">{rooms[index].line}</p></div><span class="absolute bottom-1.5 right-2.5 font-mono text-[9.5px] tabular-nums text-ink-3">{String(index + 1).padStart(2, '0')} · {String(rooms.length).padStart(2, '0')}</span></div></figure>{/snippet}
</SnapCarousel></div>
