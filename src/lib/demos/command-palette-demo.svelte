<script lang="ts">
	import CommandPalette from '#lib/components/interior/command-palette.svelte';
	const items = [{ id: 'new', label: 'New document', hint: 'Workspace', shortcut: ['⌘', 'N'] }, { id: 'dup', label: 'Duplicate document', keywords: 'copy clone' }, { id: 'del', label: 'Delete document', keywords: 'remove trash' }, { id: 'share', label: 'Share link' }, { id: 'export', label: 'Export as PDF' }]; let open = $state(false);
</script>
<button type="button" onclick={() => (open = true)} class="mat-cap press h-9 rounded-[9px] px-3.5 text-[13px]">Open commands</button><CommandPalette {items} {open} onDismiss={() => (open = false)} onSelect={() => (open = false)} autoFocus placeholder="Type a command" />
