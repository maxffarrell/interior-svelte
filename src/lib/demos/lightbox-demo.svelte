<script lang="ts">
	import Lightbox from '#lib/components/interior/lightbox.svelte';
	let open = $state(false);
	let origin: HTMLElement | null = $state(null);
	const photo = 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1280&q=80';
</script>

<div class="grid w-full place-items-center"><figure class="w-full max-w-75"><button type="button" aria-label="Open landscape" onclick={(event) => { origin = event.currentTarget; open = true; }} class="group block w-full cursor-zoom-in overflow-hidden rounded-[9px]"><img src={photo} alt="Mountain landscape" width="1280" height="800" draggable="false" class="block w-full transition-transform duration-200 group-hover:scale-[1.02]" /></button><figcaption class="mt-1.5 flex items-baseline justify-between"><span class="text-[11.5px] text-ink-3">Mountain landscape</span><span class="font-mono text-[9.5px] text-ink-3">1280 × 800</span></figcaption></figure><Lightbox open={open} onClose={() => (open = false)} originRef={origin} src={photo} alt="Mountain landscape" caption="Mountain landscape" width={1280} height={800} /></div>
