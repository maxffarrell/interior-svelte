<script lang="ts">
	import IconMorph from '#lib/components/interior/icon-morph.svelte';

	let playing = $state<number | boolean>(false);
	let open = $state<number | boolean>(false);
</script>

<div class="flex items-center gap-2">
	<IconMorph preset="play-pause" semantics="pressed" showLabel bind:active={playing} />

	<IconMorph preset="menu-close" semantics="expanded" bind:active={open} />

	<IconMorph
		labels={['Expand', 'Collapse']}
		shapes={[
			{ d: ['M 5 12 L 19 12', 'M 12 5 L 12 19'], rotate: 0 },
			{ d: ['M 5 12 L 19 12', 'M 5 12 L 19 12'], rotate: 180 }
		]}
	/>
</div>
