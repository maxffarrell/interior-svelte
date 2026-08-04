<script lang="ts">
	import LogoMarquee from '#lib/components/interior/logo-marquee.svelte';
	const items = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }, { id: 'three', label: 'Three' }];
</script>

<LogoMarquee {items} label="Partners" />
