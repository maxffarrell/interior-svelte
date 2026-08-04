<script lang="ts">
	import SliderDetents from '#lib/components/interior/slider-detents.svelte';
	let value = $state(1);
</script>

<SliderDetents label="Playback speed" value={value} onValueChange={(next) => (value = next)} min={0.5} max={2} step={0.05} detents={[{ value: 1, label: 'Normal' }, { value: 1.5, label: 'Fast' }]} format={(next) => `${next.toFixed(2)}×`} />
