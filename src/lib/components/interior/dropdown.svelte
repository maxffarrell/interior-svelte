<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export type DropdownItem = { value: string; label: string; hint?: string; disabled?: boolean };
	export type DropdownProps = {
		items: DropdownItem[];
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		emptyLabel?: string;
		class?: string;
	};
</script>

<script lang="ts">
	// @ts-nocheck
	import { AnimatePresence, motion } from 'motion-sv';
	import { reducedMotion } from '#lib/reduced-motion.svelte';

	let {
		items,
		value = $bindable(),
		defaultValue,
		onChange,
		label = 'Options',
		placeholder = 'Select an option',
		disabled = false,
		emptyLabel = 'Nothing to choose',
		class: className = ''
	}: DropdownProps = $props();

	let internal = $state(defaultValue ?? null);
	let open = $state(false);
	let activeIndex = $state(-1);
	let root = $state<HTMLDivElement | null>(null);
	let trigger = $state<HTMLButtonElement | null>(null);
	let list = $state<HTMLUListElement | null>(null);
	let itemNodes = $state<(HTMLLIElement | null)[]>([]);
	let typeahead = '';
	let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;
	const id = $props.id();
	const listId = `${id}-list`;
	const selectedValue = $derived(value ?? internal);
	const selectedIndex = $derived(items.findIndex((item) => item.value === selectedValue));
	const selectedItem = $derived(selectedIndex >= 0 ? items[selectedIndex] : null);

	function nextUsable(from: number, direction: 1 | -1) {
		if (!items.length) return -1;
		let index = from;
		for (let count = 0; count < items.length; count++) {
			index = (index + direction + items.length) % items.length;
			if (!items[index].disabled) return index;
		}
		return -1;
	}

	function edge(direction: 1 | -1) { return nextUsable(direction === 1 ? -1 : items.length, direction); }

	function openMenu(index?: number) {
		if (disabled || !items.length) return;
		const selectedUsable = selectedIndex >= 0 && !items[selectedIndex].disabled;
		activeIndex = index ?? (selectedUsable ? selectedIndex : edge(1));
		open = true;
	}

	function close(restore = true) {
		open = false;
		activeIndex = -1;
		typeahead = '';
		if (restore) trigger?.focus();
	}

	function select(index: number) {
		const item = items[index];
		if (!item || item.disabled) return;
		if (value === undefined) internal = item.value;
		value = item.value;
		onChange?.(item.value);
		close();
	}

	function search(char: string) {
		clearTimeout(typeaheadTimer);
		typeahead += char.toLowerCase();
		typeaheadTimer = setTimeout(() => (typeahead = ''), 600);
		const from = activeIndex < 0 ? 0 : activeIndex;
		for (let offset = 0; offset < items.length; offset++) {
			const index = (from + offset + (typeahead.length > 1 ? 0 : 1)) % items.length;
			if (!items[index].disabled && items[index].label.toLowerCase().startsWith(typeahead)) { activeIndex = index; return; }
		}
	}

	function onTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openMenu(); }
		else if (event.key === 'ArrowUp') { event.preventDefault(); openMenu(edge(-1)); }
	}

	function onListKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); activeIndex = nextUsable(activeIndex, event.key === 'ArrowDown' ? 1 : -1); }
		else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); activeIndex = edge(event.key === 'Home' ? 1 : -1); }
		else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(activeIndex); }
		else if (event.key === 'Escape' || event.key === 'Tab') { event.preventDefault(); close(); }
		else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); search(event.key); }
	}

	$effect(() => {
		if (!open) return;
		list?.focus();
		const outside = (event: PointerEvent) => { if (!root?.contains(event.target as Node)) close(false); };
		const blur = () => close(false);
		document.addEventListener('pointerdown', outside, true);
		window.addEventListener('blur', blur);
		return () => { document.removeEventListener('pointerdown', outside, true); window.removeEventListener('blur', blur); };
	});

	$effect(() => {
		if (open && activeIndex >= 0) itemNodes[activeIndex]?.scrollIntoView({ block: 'nearest' });
	});
</script>

<div bind:this={root} class="relative inline-block text-left {className}">
	<button bind:this={trigger} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? listId : undefined} onclick={() => open ? close() : openMenu()} onkeydown={onTriggerKeydown} class="flex h-9 select-none items-center gap-2 whitespace-nowrap rounded-[9px] border border-stone-200 bg-white px-3 text-[13px] font-medium text-stone-700 outline-none transition-[box-shadow,border-color] duration-150 disabled:opacity-50 dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200">
		<span class="sr-only">{label}: {selectedItem?.label ?? placeholder}</span><span aria-hidden>{label}</span>
		<motion.svg aria-hidden viewBox="0 0 12 12" class="size-3 shrink-0 text-stone-500" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }}><path d="M3 4.75 6 7.75 9 4.75" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></motion.svg>
	</button>
	<AnimatePresence>
		{#if open}
			<motion.div initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -6, transition: { duration: 0.12 } }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 620, damping: 38, mass: 0.6 }} style="transform-origin: top left" class="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[224px] whitespace-nowrap rounded-[11px] border border-stone-200 bg-white p-[5px] shadow-[0_1px_2px_rgba(28,25,23,0.06),0_16px_36px_-18px_rgba(28,25,23,0.5)] dark:border-white/[0.16] dark:bg-[#1D1D1A]">
				<ul bind:this={list} id={listId} role="listbox" tabindex="-1" aria-label={label} aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined} onkeydown={onListKeydown} class="relative max-h-[216px] overflow-y-auto outline-none">
					<motion.span aria-hidden class="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-[7px] bg-stone-100 dark:bg-white/10" initial={false} animate={{ y: activeIndex < 0 ? 0 : activeIndex * 32, opacity: activeIndex < 0 ? 0 : 1 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 700, damping: 46, mass: 0.5 }} />
					{#each items as item, index (item.value)}
						<li bind:this={itemNodes[index]} id={`${id}-opt-${index}`} role="option" aria-selected={index === selectedIndex} aria-disabled={item.disabled || undefined} onpointermove={() => !item.disabled && (activeIndex = index)} onclick={() => select(index)} class="relative flex h-8 cursor-default select-none items-center rounded-[7px] px-2.5 text-[13px] {item.disabled ? 'text-stone-500/70' : index === activeIndex ? 'text-stone-900 dark:text-stone-100' : 'text-stone-700 dark:text-stone-200'}">
							<span class="relative flex min-w-0 flex-1 items-center gap-3"><span class="truncate">{item.label}</span>{#if item.hint}<span class="ml-auto shrink-0 font-mono text-[10.5px] text-stone-500">{item.hint}</span>{/if}</span>
							<motion.span aria-hidden initial={false} animate={{ opacity: index === selectedIndex ? 1 : 0, scale: index === selectedIndex ? 1 : 0.7 }} transition={reducedMotion.current ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 34, mass: 0.45 }} class="relative ml-2 flex size-[14px] shrink-0 items-center justify-center"><svg viewBox="0 0 14 14" class="size-[14px]"><path d="M3 7.4 5.8 10.2 11 4.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg></motion.span>
						</li>
					{/each}
					{#if !items.length}<li role="presentation" class="flex h-8 items-center px-2.5 text-[13px] text-stone-500">{emptyLabel}</li>{/if}
				</ul>
			</motion.div>
		{/if}
	</AnimatePresence>
</div>
