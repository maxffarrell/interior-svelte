<script lang="ts">
	import TreeView, { type TreeNode } from '#lib/components/interior/tree-view.svelte';
	const nodes: TreeNode[] = [
		{ id: 'components', label: 'components', children: [{ id: 'interior', label: 'interior', children: [{ id: 'tabs', label: 'tabs.tsx', meta: '9 kB' }, { id: 'dropdown', label: 'dropdown.tsx', meta: '7 kB' }, { id: 'tree-view', label: 'tree-view.tsx', meta: '8 kB' }] }, { id: 'site', label: 'site', children: [{ id: 'sidebar', label: 'sidebar.tsx', meta: '5 kB' }, { id: 'wordmark', label: 'wordmark.tsx', meta: '1 kB' }] }] },
		{ id: 'lib', label: 'lib', children: [{ id: 'registry', label: 'registry.ts', meta: '4 kB' }, { id: 'demos-index', label: 'demos/index.tsx', meta: '3 kB' }] },
		{ id: 'design', label: 'DESIGN.md', meta: '38 kB' }
	];
</script>

<div class="mx-auto w-full max-w-[300px]"><TreeView {nodes} label="Project files" defaultExpanded={['components', 'interior']} defaultSelected="tabs" /></div>
