<script lang="ts">
	import Lightbox from '#lib/components/interior/lightbox.svelte';
	let open = $state(false);
	const src = 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1280&q=80';
</script>

<div><button type="button" class="mat-cap overflow-hidden rounded-[9px]" onclick={() => (open = true)}><img src={src} alt="Open preview" width="320" height="200" /></button><Lightbox {open} onClose={() => (open = false)} {src} alt="Preview" /></div>
