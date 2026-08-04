<script lang="ts">
	import { onMount } from 'svelte';
	import BlurUpImage from '#lib/components/interior/blur-up-image.svelte';

	const PHOTO = '/demo/hillside-castle.jpg';
	const BROKEN = 'data:image/png;base64,Zm9v';
	const LQIP = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="20"%3E%3Crect width="32" height="20" fill="%238e977f"/%3E%3C/svg%3E';
	const CAP = 'mat-cap press rounded-[6px] px-2.5 py-1.5 text-[12.5px] text-ink-2 hover:text-ink';

	let src = $state<string | undefined>();
	let timer: ReturnType<typeof setTimeout> | undefined;
	let pending = false;

	function load(next: string) {
		if (pending) return;
		pending = true;
		src = undefined;
		const bust = next.startsWith('/') ? `${next}?t=${Date.now()}` : next;
		timer = setTimeout(() => { pending = false; src = bust; }, 700);
	}

	onMount(() => {
		load(PHOTO);
		return () => { if (timer) clearTimeout(timer); };
	});
</script>

<div class="mx-auto w-full max-w-85">
	<BlurUpImage src={src} alt="Hilltop castle above a wooded valley, under a clouded sky" width={320} height={200} placeholder={LQIP} color="#8e977f" />
	<div class="mt-3 flex justify-center gap-2">
		<button type="button" onclick={() => load(PHOTO)} class={CAP}>Load</button>
		<button type="button" onclick={() => load(BROKEN)} class={CAP}>Dead URL</button>
	</div>
</div>
