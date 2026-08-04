<script lang="ts">
	import { onMount } from 'svelte';
	import LiveActivity from '#lib/components/interior/live-activity.svelte';
	import { LiveActivityState } from '#lib/components/interior/live-activity.state.svelte';

	const STEPS = 24;
	const TICK = 140;
	const LINES = ['w-[88%]', 'w-[64%]', 'w-[76%]', 'w-[52%]', 'w-[70%]'];
	const pod = new LiveActivityState();
	let runs = 0;
	let ticker: ReturnType<typeof setInterval> | undefined;

	function stop() { if (ticker) clearInterval(ticker); ticker = undefined; }
	function deploy() {
		stop(); runs += 1;
		const failing = runs % 3 === 0;
		pod.start({ title: 'Deploying site', detail: 'interior-dev · production', progress: 0 });
		let step = 0;
		ticker = setInterval(() => {
			step += 1;
			if (failing && step >= Math.round(STEPS * 0.6)) { stop(); pod.fail({ detail: 'Build failed at step 14 of 24' }, { label: 'Retry', onClick: deploy }); return; }
			if (step >= STEPS) { stop(); pod.succeed({ detail: 'Live at interior-dev.vercel.app' }); return; }
			pod.update({ progress: step / STEPS });
		}, TICK);
	}
	onMount(() => () => { stop(); pod.destroy(); });
</script>

<div class="relative h-full min-h-[280px] w-full"><div class="pointer-events-none absolute inset-x-0 top-4 z-10"><LiveActivity activity={pod.activity} onDismiss={pod.dismiss} /></div><div aria-hidden="true" class="space-y-4 px-6 pt-20">{#each LINES as width}<div class="h-2.5 rounded-[2px] bg-stone-800/[0.06] dark:bg-white/[0.05] {width}"></div>{/each}</div><div class="absolute right-4 bottom-4"><button type="button" onclick={deploy} class="inline-flex h-8 select-none items-center rounded-[9px] border border-stone-200 bg-white px-3 text-[12.5px] font-medium text-stone-700 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.95),inset_0_-1px_0_rgba(28,25,23,0.06),0_1px_2px_rgba(28,25,23,0.08)] outline-none transition-colors duration-150 hover:bg-stone-50 focus-visible:border-[#4568FF] dark:border-white/[0.16] dark:bg-[#252522] dark:text-stone-200">Deploy</button></div></div>
