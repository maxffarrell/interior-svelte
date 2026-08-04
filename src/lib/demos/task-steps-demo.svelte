<script lang="ts">
	import TaskSteps from '#lib/components/interior/task-steps.svelte';
	const STEPS = [{ id: 'queue', label: 'Queued', meta: '0.2s' }, { id: 'build', label: 'Building', meta: '8.1s' }, { id: 'test', label: 'Running checks', meta: '3.4s' }, { id: 'deploy', label: 'Deploying', meta: '5.0s' }];
	let current = $state(0);
	$effect(() => {
		const timer = setTimeout(() => (current = current >= STEPS.length ? 0 : current + 1), current >= STEPS.length ? 2400 : 1500);
		return () => clearTimeout(timer);
	});
</script>

<div class="mx-auto w-full max-w-[280px]"><TaskSteps steps={STEPS} {current} label="Deploy progress" /></div>
