<script lang="ts">
	import ContextMenu from '#lib/components/interior/context-menu.svelte'; import type { ContextMenuItem } from '#lib/components/interior/context-menu.svelte';
	let files = $state(['cover-final-v4.png', 'hero-crop@2x.png', 'desk-shot-0912.jpg']);
	function actions(name: string): ContextMenuItem[] { return [{ id: 'open', label: 'Open', shortcut: '↵' }, { id: 'rename', label: 'Rename', shortcut: 'F2' }, { id: 'sep', type: 'separator' }, { id: 'trash', label: 'Move to trash', onSelect: () => (files = files.filter((file) => file !== name)) }]; }
</script>
<div class="mx-auto w-full max-w-[380px] space-y-1">{#each files as file (file)}<ContextMenu label={`Actions for ${file}`} items={actions(file)} class="flex h-[50px] items-center rounded-[9px] bg-sub px-3"><span class="text-[12.5px] font-medium">{file}</span></ContextMenu>{/each}</div>
