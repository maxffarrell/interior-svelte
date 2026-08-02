<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';

	export type Props = HTMLAttributes<HTMLDivElement>;
</script>

<script lang="ts">
	import { page } from '$app/state';
	import type { Attachment } from 'svelte/attachments';
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import List from 'phosphor-svelte/lib/ListIcon';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import Sidebar from './sidebar.svelte';

	let { class: className, ...rest }: Props = $props();

	let open = $state(false);
	let opener = $state<HTMLButtonElement>();

	const pathname = $derived(page.url.pathname);
	$effect(() => {
		if (pathname) {
			open = false;
		}
	});

	$effect(() => {
		if (!open) return;

		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previous;
			// Focus goes back where it came from, not to the top of the document.
			opener?.focus();
		};
	});

	const portal: Attachment<HTMLDivElement> = (node) => {
		document.body.appendChild(node);
		return () => node.remove();
	};

	const sheetIn = $derived.by(() => {
		if (reducedMotion.current) return { duration: 0 };

		return { x: -280, duration: 320, opacity: 1, easing: quintOut };
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />

<div {...rest} class={cn('lg:hidden', className)}>
	<button
		bind:this={opener}
		type="button"
		aria-expanded={open}
		aria-label="Browse components"
		onclick={() => (open = true)}
		class="mat-cap press flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
	>
		<List size={12} weight="bold" aria-hidden="true" />
		<span class="hidden sm:inline">Components</span>
	</button>
</div>

{#if open}
	<div {@attach portal}>
		<button
			type="button"
			aria-label="Close navigation"
			onclick={() => (open = false)}
			transition:fade={{ duration: reducedMotion.current ? 0 : 200 }}
			class="fixed inset-0 z-40 bg-black/25 dark:bg-black/55"
		></button>

		<aside
			transition:fly={sheetIn}
			class="fixed inset-y-0 left-0 z-50 w-70 max-w-[85vw] overflow-hidden rounded-r-[20px] bg-bezel p-3 shadow-(--shadow-float)"
		>
			<div class="h-full">
				<Sidebar />
			</div>
		</aside>
	</div>
{/if}
