<script lang="ts">
	import ProgressBar from '#lib/components/interior/progress-bar.svelte';
	let value = $state<number | null>(null);
	let timer: ReturnType<typeof setInterval>;
	function start() {
		clearInterval(timer);
		value = 0;
		timer = setInterval(() => {
			if (value === null) return;
			value = value >= 100 ? 0 : value + 10;
		}, 350);
	}
</script>

<div class="grid gap-4">
	<ProgressBar {value} label={value === null ? 'Syncing files' : 'Uploading files'} /><button
		class="press mat-cap h-8 w-fit rounded-[9px] px-3 text-[12px]"
		onclick={start}>Start upload</button
	>
</div>
