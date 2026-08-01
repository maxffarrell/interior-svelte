<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
	import { mode, setMode } from 'mode-watcher';
	import Sun from 'phosphor-svelte/lib/SunIcon';
	import Moon from 'phosphor-svelte/lib/MoonIcon';
	import { cn } from '#lib/utils';

	let { class: className, ...rest }: Props = $props();

	// `undefined` until mode-watcher has resolved the stored or system preference.
	// The thumb stays hidden until then rather than sliding in from the wrong side.
	const resolved = $derived(mode.current ?? 'unset');
</script>

<div
	role="group"
	aria-label="Theme"
	{...rest}
	data-mode={resolved}
	class={cn('mat-well group relative flex h-6.5 w-13.5 items-center rounded-lg p-0.75', className)}
>
	<span
		aria-hidden="true"
		class="mat-cap absolute top-0.75 left-0.75 h-5 w-6 rounded-[5px] transition-transform duration-220 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[mode=dark]:translate-x-6 group-data-[mode=unset]:opacity-0"
	></span>

	<button
		type="button"
		onclick={() => setMode('light')}
		aria-label="Light"
		aria-pressed={resolved === 'light'}
		class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] text-ink-3 aria-pressed:text-ink"
	>
		<Sun size={13} weight="fill" aria-hidden="true" />
	</button>

	<button
		type="button"
		onclick={() => setMode('dark')}
		aria-label="Dark"
		aria-pressed={resolved === 'dark'}
		class="relative z-10 grid h-5 w-6 place-items-center rounded-[5px] text-ink-3 aria-pressed:text-ink"
	>
		<Moon size={13} weight="fill" aria-hidden="true" />
	</button>
</div>
