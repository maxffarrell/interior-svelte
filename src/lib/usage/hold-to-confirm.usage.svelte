<script lang="ts">
	import { goto } from '$app/navigation';
	import HoldToConfirm from '#lib/components/interior/hold-to-confirm.svelte';

	let { workspaceId }: { workspaceId: string } = $props();
	let pending = $state(false);

	function track(event: string, data: Record<string, unknown>) {
		navigator.sendBeacon('/api/events', JSON.stringify({ event, ...data }));
	}
</script>

<section class="mat-panel rounded-[14px] p-4">
	<h2 class="text-[13px] font-medium text-ink">Delete this workspace</h2>
	<p class="mt-1 mb-3 text-[12.5px] text-ink-3">
		Members, files and history go with it. There is no undo.
	</p>

	<HoldToConfirm
		label="Delete workspace"
		confirmLabel="Workspace deleted"
		duration={1400}
		disabled={pending}
		onAbort={() => track('workspace.delete.abandoned', { workspaceId })}
		onConfirm={async () => {
			pending = true;
			await fetch(`/api/workspaces/${workspaceId}`, { method: 'DELETE' });
			await goto('/workspaces');
		}}
	/>
</section>
