<script lang="ts" module>
	import type { PackageManager } from '#lib/package-manager.svelte';

	export type Command = {
		html: string;
		code: string;
	};

	export type Props = {
		commands: Record<PackageManager, Command>;
	};
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import CopySource from './copy-source.svelte';
	import PackageManagerSwitch from './package-manager-switch.svelte';
	import { packageManager, packageManagers } from '#lib/package-manager.svelte';
	import { on } from 'svelte/events';

	let { commands }: Props = $props();

	const FADE = 26;

	let slack = $state(0);
	let offset = $state(0);

	const scrolls = $derived(slack > 1);

	const watch: Attachment<HTMLDivElement> = (node) => {
		const read = () => {
			slack = node.scrollWidth - node.clientWidth;
			offset = node.scrollLeft;
		};

		read();

		const scrollEvent = on(node, 'scroll', read, { passive: true });

		const observer = new ResizeObserver(read);
		observer.observe(node);

		return () => {
			scrollEvent();
			observer.disconnect();
		};
	};
</script>

<div class="mt-3">
	<div class="mb-1.5 flex h-5.5 items-center justify-between gap-3 pl-1">
		<span class="meta truncate text-ink-3">terminal</span>
		<div class="flex items-center gap-2">
			<PackageManagerSwitch />
			<CopySource code={commands[packageManager.current].code} />
		</div>
	</div>

	<div class="mat-well rounded-[10px] px-4.5 py-3.5">
		<div
			class="term grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 font-mono text-[12.5px] leading-[1.65]"
		>
			<span aria-hidden="true" class="text-ink-3 select-none">$</span>

			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				{@attach watch}
				role={scrolls ? 'region' : undefined}
				aria-label={scrolls ? 'Install command' : undefined}
				tabindex={scrolls ? 0 : undefined}
				class="fade-scroll no-bar min-w-0 overflow-x-auto"
				style:--fade-l="{offset > 1 ? FADE : 0}px"
				style:--fade-r="{offset < slack - 1 ? FADE : 0}px"
			>
				<div class="grid w-max">
					{#each packageManagers as pm (pm)}
						<div data-pm-cmd={pm} class="col-start-1 row-start-1">
							<!-- eslint-disable-next-line svelte/no-at-html-tags  -->
							{@html commands[pm].html}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
