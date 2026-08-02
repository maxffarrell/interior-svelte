<script lang="ts">
	import HoldToConfirm from '#lib/components/interior/hold-to-confirm.svelte';
</script>

<div class="flex justify-center">
	<HoldToConfirm
		label="Hold to delete workspace"
		confirmLabel="Workspace deleted"
		onConfirm={() => {}}
	/>
</div>
