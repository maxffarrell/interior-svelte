<script lang="ts" module>
	import type { Attachment, Snippet } from 'svelte';

	export type ModalProps = {
		open: boolean;
		onClose: () => void;
		title: Snippet;
		description?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		closeLabel?: string;
		showClose?: boolean;
		closeOnEscape?: boolean;
		closeOnBackdrop?: boolean;
		lockScroll?: boolean;
		initialFocusRef?: HTMLElement | null;
		container?: HTMLElement | null;
		maxWidth?: number;
		maxHeight?: string;
		class?: string;
	};

	const FOCUSABLE =
		"a[href],area[href],button:not([disabled]),input:not([disabled]):not([type='hidden']),select:not([disabled]),textarea:not([disabled]),iframe,summary,[contenteditable='true'],[tabindex]:not([tabindex='-1'])";
	let scrollLocks = 0;
	let restoreScroll: (() => void) | undefined;
	const stack: object[] = [];
</script>

	<script lang="ts">
		// @ts-nocheck
		import { AnimatePresence, motion } from 'motion-sv';
		import { reducedMotion } from '#lib/reduced-motion.svelte';

		const EASE = [0.23, 1, 0.32, 1] as const;
		const LEAVE = [0.4, 0, 1, 1] as const;
		const SURFACE = { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 } as const;

	let {
		open,
		onClose,
		title,
		description,
		children,
		footer,
		closeLabel = 'Close dialog',
		showClose = true,
		closeOnEscape = true,
		closeOnBackdrop = true,
		lockScroll = true,
		initialFocusRef = null,
		container,
		maxWidth = 440,
		maxHeight = 'min(78vh, 620px)',
		class: className = ''
	}: ModalProps = $props();

	let root = $state<HTMLDivElement | null>(null);
	let panel = $state<HTMLDivElement | null>(null);
		let previousFocus: HTMLElement | null = null;
		let downedOutside = false;
	const id = $props.id();
	const titleId = `${id}-title`;
	const descriptionId = `${id}-description`;
	const portal: Attachment<HTMLDivElement> = (node) => {
		(container ?? document.body).appendChild(node);
		return () => node.remove();
	};

		function focusableWithin(element: HTMLElement) {
			return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
				(node) => node.tabIndex !== -1 && !node.hasAttribute('inert') && node.getAttribute('aria-hidden') !== 'true' && node.getClientRects().length > 0
			);
		}

	function lock() {
		scrollLocks += 1;
		if (scrollLocks !== 1) return;
		const body = document.body;
		const overflow = body.style.overflow;
		const padding = body.style.paddingRight;
		const gap = window.innerWidth - document.documentElement.clientWidth;
		body.style.overflow = 'hidden';
		if (gap > 0) body.style.paddingRight = `${(parseFloat(padding) || 0) + gap}px`;
		restoreScroll = () => {
			body.style.overflow = overflow;
			body.style.paddingRight = padding;
		};
	}

	function unlock() {
		scrollLocks = Math.max(0, scrollLocks - 1);
		if (!scrollLocks) {
			restoreScroll?.();
			restoreScroll = undefined;
		}
	}

	function panelKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab' || !panel) return;
		const items = focusableWithin(panel);
		if (!items.length) {
			event.preventDefault();
			panel.focus({ preventScroll: true });
			return;
		}
		const first = items[0];
		const last = items.at(-1)!;
		if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
			event.preventDefault();
			last.focus({ preventScroll: true });
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus({ preventScroll: true });
		}
	}

		$effect(() => {
			if (!open || !panel) return;
		previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		(initialFocusRef ?? focusableWithin(panel)[0] ?? panel).focus({ preventScroll: true });
		const focusIn = (event: FocusEvent) => {
			if (!panel?.contains(event.target as Node)) panel?.focus({ preventScroll: true });
		};
		const escape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !closeOnEscape || stack.at(-1) !== token) return;
			event.preventDefault();
			event.stopPropagation();
			onClose();
		};
		const token = {};
		stack.push(token);
		document.addEventListener('focusin', focusIn);
		document.addEventListener('keydown', escape);
		return () => {
			document.removeEventListener('focusin', focusIn);
			document.removeEventListener('keydown', escape);
			const index = stack.indexOf(token);
			if (index >= 0) stack.splice(index, 1);
			if (!open && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
		};
	});

		$effect(() => {
			if (!open || !root) return;
		const muted: Array<[HTMLElement, string | null]> = [];
		for (const node of Array.from(document.body.children)) {
			if (node !== root && node instanceof HTMLElement) {
				muted.push([node, node.getAttribute('inert')]);
				node.setAttribute('inert', '');
			}
		}
		return () => muted.forEach(([node, value]) => value === null ? node.removeAttribute('inert') : node.setAttribute('inert', value));
	});

		$effect(() => {
			if (!open || !lockScroll) return;
			lock();
			return unlock;
		});

		function overlayPointerDown(event: PointerEvent) {
			downedOutside = !panel?.contains(event.target as Node);
		}

		function overlayClick(event: MouseEvent) {
			if (!closeOnBackdrop || panel?.contains(event.target as Node) || !downedOutside) return;
			downedOutside = false;
			onClose();
		}
	</script>

	<div bind:this={root} {@attach portal}>
		<AnimatePresence>
		{#if open}
			<div class="fixed inset-0 z-50 grid place-items-center p-4 sm:p-6" onpointerdown={overlayPointerDown} onclick={overlayClick}>
			<motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: reducedMotion.current ? { duration: 0 } : { duration: 0.15, ease: LEAVE } }} transition={reducedMotion.current ? { duration: 0 } : { duration: 0.2, ease: EASE }} style="touch-action: none" class="absolute inset-0 bg-stone-900/40 dark:bg-black/65" />
			<motion.div bind:this={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} tabindex="-1" initial={reducedMotion.current ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={reducedMotion.current ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98, y: 6, transition: { duration: 0.15, ease: LEAVE } }} transition={reducedMotion.current ? { duration: 0 } : { ...SURFACE, opacity: { duration: 0.16, ease: EASE } }} style={{ maxWidth: `${maxWidth}px`, maxHeight }} class="relative flex w-full flex-col overflow-hidden rounded-[14px] border border-stone-200 bg-white text-stone-700 shadow-[0_28px_56px_-24px_rgba(24,22,20,0.45)] outline-none dark:border-white/[0.16] dark:bg-[#1D1D1A] dark:text-stone-200 {className}" onkeydown={panelKeydown}>
			<div class="flex shrink-0 items-start gap-3 px-4 pt-4 pb-3"><div class="min-w-0 flex-1"><h2 id={titleId} class="text-[15px] font-medium tracking-[-0.01em] text-stone-800 dark:text-stone-100">{@render title()}</h2>{#if description}<p id={descriptionId} class="mt-1 text-[12.5px] leading-relaxed text-stone-500 dark:text-stone-400">{@render description()}</p>{/if}</div>{#if showClose}<button type="button" onclick={onClose} aria-label={closeLabel} class="-mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-[7px] text-stone-400 outline-none transition-colors hover:bg-stone-100 focus-visible:shadow-[inset_0_0_0_1px_#4568FF] dark:hover:bg-white/10">×</button>{/if}</div>
			{#if children}<div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 text-[13px] leading-relaxed">{@render children()}</div>{/if}
			{#if footer}<div class="flex shrink-0 items-center justify-end gap-2 border-t border-stone-200 px-4 py-3 dark:border-white/[0.16]">{@render footer()}</div>{/if}
			</motion.div>
			</div>
		{/if}
		</AnimatePresence>
	</div>
