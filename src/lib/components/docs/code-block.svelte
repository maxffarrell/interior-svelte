<script lang="ts" module>
	export type Props = {
		html: string;
		code: string;
		filename?: string;
	};
</script>

<script lang="ts">
	import CodeSurface from './code-surface.svelte';
	import CopySource from './copy-source.svelte';

	let { html, code, filename }: Props = $props();
</script>

<div class="mt-3">
	{#if filename}
		<div class="mb-1.5 flex h-6 items-center justify-between gap-3 pl-1">
			<span class="meta truncate text-ink-3">{filename}</span>
			<CopySource {code} />
		</div>
	{/if}

	<CodeSurface {html} />
</div>
