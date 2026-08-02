<script lang="ts" module>
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ExpandingSearchOptions } from './expanding-search.state.svelte';

	export type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> &
		ExpandingSearchOptions & {
			label?: string;
			placeholder?: string;
			resultCount?: number;
			align?: 'left' | 'right';
		};
</script>

<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';
	import { cn } from '#lib/utils';
	import { ExpandingSearchState } from './expanding-search.state.svelte';

	const DISCLOSE = { type: 'spring', stiffness: 380, damping: 38, mass: 0.7 } as const;
	const CROSSFADE = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const;
	const CELL = { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 } as const;
	const INSTANT = { duration: 0 } as const;

	const COLLAPSED = 40;
	const TEXT_LEFT = 34;
	const CLEAR_SLOT = 35;
	const COUNT_SLOT = 38;
	const ANNOUNCE_DELAY = 500;

	let {
		label = 'Search',
		placeholder = 'Search',
		resultCount,
		align = 'right',
		value = $bindable(),
		defaultValue = '',
		onChange,
		onSearch,
		onSubmit,
		open = $bindable(),
		defaultOpen = false,
		onOpenChange,
		debounce = 220,
		collapseOnBlur = true,
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const search = new ExpandingSearchState(() => ({
		value,
		defaultValue,

		onChange: (next) => {
			if (value !== undefined) value = next;
			onChange?.(next);
		},
		onSearch,
		onSubmit,
		open,
		defaultOpen,
		onOpenChange: (next) => {
			if (open !== undefined) open = next;
			onOpenChange?.(next);
		},
		debounce,
		collapseOnBlur,
		disabled
	}));

	const uid = $props.id();
	const inputId = `${uid}-field`;
	const liveId = `${uid}-live`;

	let inputRef = $state<HTMLInputElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);

	let track = $state(0);

	const measure: Attachment<HTMLDivElement> = (node) => {
		let last = 0;
		const read = (width: number) => {
			if (Math.abs(last - width) < 0.5) return;
			last = width;
			track = width;
		};

		read(node.getBoundingClientRect().width);

		const observer = new ResizeObserver((entries) => {
			const box = entries[0];
			if (box) read(box.contentRect.width);
		});
		observer.observe(node);

		return () => observer.disconnect();
	};

	const expanded = $derived(Math.max(COLLAPSED, track));
	const rightInset = $derived(CLEAR_SLOT + (resultCount === undefined ? 0 : COUNT_SLOT));
	const inner = $derived(Math.max(0, expanded - TEXT_LEFT - rightInset));

	const shellMotion = $derived(reducedMotion.current ? INSTANT : DISCLOSE);
	const fadeMotion = $derived(reducedMotion.current ? INSTANT : CROSSFADE);
	const cellMotion = $derived(reducedMotion.current ? INSTANT : CELL);
	const textMotion = $derived(
		reducedMotion.current ? INSTANT : { ...CROSSFADE, delay: search.open ? 0.06 : 0 }
	);

	let announced = $state('');

	$effect(() => {
		const isOpen = search.open;
		const query = search.query;
		const count = resultCount;

		const id = setTimeout(() => {
			if (!isOpen || query.length === 0 || count === undefined) {
				announced = '';
				return;
			}
			announced = `${count} ${count === 1 ? 'result' : 'results'} for ${query}`;
		}, ANNOUNCE_DELAY);

		return () => clearTimeout(id);
	});
</script>

<div
	role="search"
	{...rest}
	{...search.rootProps}
	data-disabled={disabled || undefined}
	class={cn('relative h-10 w-full', className)}
	{@attach measure}
>
	<motion.div
		initial={false}
		animate={{ width: search.open ? expanded : COLLAPSED }}
		transition={shellMotion}
		onmousedown={(event) => {
			if (event.target !== event.currentTarget) return;
			event.preventDefault();
			if (search.open) search.focusField();
		}}
		data-align={align}
		data-focused={search.focused || undefined}
		class="mat-well absolute inset-y-0 overflow-hidden rounded-[10px] border-2 border-hairline transition-[border-color] duration-150 data-focused:border-accent data-[align=left]:left-0 data-[align=right]:right-0"
	>
		<motion.input
			{...search.inputProps}
			bind:ref={inputRef}
			id={inputId}
			type="search"
			{placeholder}
			aria-label={label}
			aria-describedby={liveId}
			autocomplete="off"
			spellcheck="false"
			enterkeyhint="search"
			style={{ width: inner }}
			initial={false}
			animate={{ opacity: search.open ? 1 : 0 }}
			transition={textMotion}
			class="absolute inset-y-0 left-8.5 bg-transparent text-[13px]/9 text-ink-2 outline-none placeholder:text-ink-3 focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
		/>

		<motion.div
			initial={false}
			animate={{ opacity: search.open ? 1 : 0 }}
			transition={fadeMotion}
			class="pointer-events-none absolute inset-y-0 right-1.75 flex items-center gap-1.5"
		>
			{#if resultCount !== undefined}
				<span aria-hidden="true" class="meta tnum w-8 truncate text-right text-ink-3">
					{search.filled ? resultCount : ''}
				</span>
			{/if}

			<motion.button
				type="button"
				onclick={search.clear}
				tabindex={search.open && search.filled ? 0 : -1}
				aria-label="Clear search"
				aria-controls={inputId}
				initial={false}
				animate={{ opacity: search.filled ? 1 : 0, scale: search.filled ? 1 : 0.86 }}
				transition={cellMotion}
				data-live={(search.open && search.filled) || undefined}
				class="grid size-5.5 place-items-center rounded-md text-ink-3 focus-visible:-outline-offset-2 data-live:pointer-events-auto"
			>
				<svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
					<path
						d="M1.7 1.7 L9.3 9.3 M9.3 1.7 L1.7 9.3"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			</motion.button>
		</motion.div>
	</motion.div>

	<motion.button
		{...search.triggerProps}
		bind:ref={triggerRef}
		aria-label={label}
		aria-controls={inputId}
		initial={false}
		animate={{ x: align === 'right' && search.open ? -(expanded - COLLAPSED) : 0 }}
		transition={shellMotion}
		data-align={align}
		data-open={search.open || undefined}
		class="absolute inset-y-0 z-10 grid w-10 place-items-center rounded-lg text-ink-3 focus-visible:-outline-offset-2 disabled:opacity-50 data-open:pointer-events-none data-[align=left]:left-0 data-[align=right]:right-0"
	>
		<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
			<circle cx="6.4" cy="6.4" r="4.5" stroke="currentColor" stroke-width="1.4" />
			<path
				d="M9.8 9.8 L13.2 13.2"
				stroke="currentColor"
				stroke-width="1.4"
				stroke-linecap="round"
			/>
		</svg>
	</motion.button>

	<span id={liveId} aria-live="polite" class="sr-only">{announced}</span>
</div>
