<script lang="ts">
	import Dropdown from '#lib/components/interior/dropdown.svelte'; const items = [{ value: 'private', label: 'Only me', hint: 'default' }, { value: 'team', label: 'Anyone at Acme' }, { value: 'link', label: 'Anyone with the link' }, { value: 'public', label: 'Public on the web' }]; let value = $state('private');
</script>
<Dropdown {items} bind:value label="Visibility" />
