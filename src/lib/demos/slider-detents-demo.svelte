<script lang="ts">
	import SliderDetents from '#lib/components/interior/slider-detents.svelte';
	const presets = [{ value: 0.5, label: '0.5×' }, { value: 1, label: 'Normal' }, { value: 1.5, label: '1.5×' }, { value: 2, label: '2×' }];
	let value = $state(1.35);
</script>

<div class="grid w-full place-items-center"><div class="w-full max-w-85"><SliderDetents value={value} onValueChange={(next) => (value = next)} min={0.25} max={2} step={0.05} detents={presets} format={(n) => `${n.toFixed(2)}×`} /></div></div>
