<script lang="ts">
	import ValueFlash from '#lib/components/interior/value-flash.svelte';
	let total = $state(1284);
</script>

<div class="grid gap-3"><ValueFlash value={total} label="Requests per second" format={(value) => value.toLocaleString('en-US')} /><button type="button" class="mat-cap h-8 w-fit rounded-[6px] px-2.5 text-[12px]" onclick={() => (total += 25)}>Refresh count</button></div>
