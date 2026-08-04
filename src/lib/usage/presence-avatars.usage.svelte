<script lang="ts">
	import PresenceAvatars from '#lib/components/interior/presence-avatars.svelte';
	const people = [{ id: 'ana', name: 'Ana Ruiz' }, { id: 'ivo', name: 'Ivo Bergman' }, { id: 'noor', name: 'Noor Haddad' }];
</script>

<PresenceAvatars {people} label="People here" />
