<script lang="ts">
	import TaskSteps from '#lib/components/interior/task-steps.svelte';
	const steps = [{ id: 'one', label: 'Prepare' }, { id: 'two', label: 'Process' }, { id: 'three', label: 'Finish' }];
</script>

<TaskSteps {steps} current={1} />
