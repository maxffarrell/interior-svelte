<script lang="ts">
	import LoadMore from '#lib/components/interior/load-more.svelte';
	let page = $state(0);
	const load = async () => { await new Promise((resolve) => setTimeout(resolve, 200)); page += 1; return page < 3; };
</script>

<LoadMore onLoad={load} hasMore={page < 3} />
