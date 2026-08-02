<script lang="ts">
	import CopyButton from '#lib/components/interior/copy-button.svelte';

	const TOKEN = 'interior_demo_a1b2c3d4';
</script>

<div class="flex justify-center">
	<CopyButton value={TOKEN} />
</div>
