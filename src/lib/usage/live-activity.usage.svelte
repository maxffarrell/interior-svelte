<script lang="ts">
	import LiveActivity from '#lib/components/interior/live-activity.svelte';
	const activity = { id: 'upload', title: 'Uploading files', detail: '3 of 8 files', progress: 0.38, phase: 'running' as const };
</script>

<LiveActivity {activity} />
