<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { cn } from '#lib/utils';
	import { packageManager, packageManagers } from '#lib/package-manager.svelte';

	let { class: className, ...rest }: Props = $props();

	const cells: HTMLButtonElement[] = [];

	const cell =
		(i: number): Attachment<HTMLButtonElement> =>
		(node) => {
			cells[i] = node;
		};

	const index = $derived(packageManagers.indexOf(packageManager.current));

	const STEP: Record<string, number> = {
		ArrowRight: 1,
		ArrowDown: 1,
		ArrowLeft: -1,
		ArrowUp: -1
	};

	function onkeydown(event: KeyboardEvent) {
		const step = STEP[event.key];
		if (!step) return;

		event.preventDefault();
		const next = (index + step + packageManagers.length) % packageManagers.length;
		packageManager.current = packageManagers[next];
		cells[next]?.focus();
	}
</script>

<div
	role="radiogroup"
	aria-label="Package manager"
	{...rest}
	{onkeydown}
	class={cn('mat-well relative grid grid-cols-4 rounded-[7px] p-0.75', className)}
>
	<span
		aria-hidden="true"
		class="mat-cap pointer-events-none absolute top-0.75 left-0.75 h-4 w-9.5 rounded-[5px] transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
		style="transform: translateX(calc(var(--pm-i) * 100%))"
	></span>

	{#each packageManagers as pm, i (pm)}
		<button
			{@attach cell(i)}
			type="button"
			role="radio"
			aria-checked={packageManager.current === pm}
			tabindex={index === i ? 0 : -1}
			data-pm-opt={pm}
			onclick={() => (packageManager.current = pm)}
			class="press relative z-10 h-4 w-9.5 rounded-[5px] font-mono text-[10.5px] leading-[1.4] hover:text-ink"
		>
			{pm}
		</button>
	{/each}
</div>
