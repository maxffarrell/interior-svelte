<script lang="ts">
	import ValueFlash from '#lib/components/interior/value-flash.svelte';
	const steps = [-120, -17, 25, 140];
	let value = $state(1284);
</script>

<div class="mx-auto flex w-full max-w-110 flex-col items-center gap-5"><ValueFlash value={value} format={(n) => n.toLocaleString('en-US')} label="Requests per second" class="text-[24px]" /><div class="flex gap-1.5">{#each steps as step}<button type="button" onclick={() => (value = Math.min(9600, Math.max(1002, value + step)))} class="mat-cap press h-8 rounded-[6px] px-2.5 text-[12px] font-medium tabular-nums text-ink-2">{step > 0 ? '+' : '−'}{Math.abs(step)}</button>{/each}</div></div>
