<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Props = HTMLButtonAttributes & {
		code: string;
	};
</script>

<script lang="ts">
	import Check from 'phosphor-svelte/lib/CheckIcon';
	import { cn } from '#lib/utils';

	let { code, class: className, ...rest }: Props = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 2000);
	}

	$effect(() => () => clearTimeout(timer));
</script>

<button
	type="button"
	{...rest}
	onclick={copy}
	data-copied={copied || undefined}
	class={cn(
		'mat-cap press group grid h-5.5 place-items-center rounded-md px-2 text-[10.5px] font-medium text-ink-2 hover:text-ink',
		className
	)}
>
	<span class="col-start-1 row-start-1 transition-opacity duration-100 group-data-copied:opacity-0">
		copy
	</span>
	<span
		aria-hidden="true"
		class="col-start-1 row-start-1 inline-flex items-center text-moss opacity-0 transition-opacity duration-100 group-data-copied:opacity-100"
	>
		<Check size={11} weight="bold" aria-hidden="true" />
	</span>
	<span class="sr-only" role="status">{copied ? 'Copied' : ''}</span>
</button>
