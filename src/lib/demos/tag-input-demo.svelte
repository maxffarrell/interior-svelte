<script lang="ts">
	import TagInput from '#lib/components/interior/tag-input.svelte';

	const START = ['motion', 'focus order'];
</script>

<div class="flex w-full justify-center">
	<div class="h-37.5 w-full max-w-105">
		<TagInput defaultValue={START} max={6} placeholder="Add a topic" />
	</div>
</div>
