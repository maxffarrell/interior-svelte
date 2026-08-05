<script lang="ts" module>
	import type { Snippet } from 'svelte';
	export type Props = { children: Snippet; openDelay?: number; closeDelay?: number; skipDelay?: number; class?: string };

	export const TOOLTIP_GROUP_KEY = Symbol('interior-tooltip-group');

	type Listener = () => void;
	type Timer = ReturnType<typeof setTimeout> | undefined;

	export type TooltipGroupStore = {
		seat: string;
		subscribe: (listener: Listener) => () => void;
		getActive: () => string | null;
		getWarm: () => boolean;
		getSkipped: () => boolean;
		getTravel: () => number;
		open: (id: string, immediate: boolean, x?: number) => void;
		close: (id: string, immediate: boolean) => void;
		dismiss: (id: string) => void;
		unblock: (id: string) => void;
		reset: () => void;
		dispose: () => void;
	};

	let groupCount = 0;
	const stop = (timer: Timer) => {
		if (timer) clearTimeout(timer);
		return undefined;
	};

	export function createTooltipGroupStore(getTiming: () => { openDelay: number; closeDelay: number; skipDelay: number }): TooltipGroupStore {
		const listeners = new Set<Listener>();
		let active: string | null = null;
		let pending: string | null = null;
		let blocked: string | null = null;
		let warm = false;
		let skipped = false;
		let lastX: number | null = null;
		let travel = 0;
		let openTimer: Timer;
		let closeTimer: Timer;
		let coolTimer: Timer;
		const notify = () => listeners.forEach((listener) => listener());
		const setActive = (next: string | null) => {
			if (active === next) return;
			if (next !== null) {
				skipped = warm;
				warm = true;
			}
			active = next;
			notify();
		};
		const cool = () => {
			coolTimer = stop(coolTimer);
			const delay = getTiming().skipDelay;
			if (delay <= 0) {
				warm = false;
				notify();
				return;
			}
			coolTimer = setTimeout(() => {
				coolTimer = undefined;
				warm = false;
				notify();
			}, delay);
		};
		const store: TooltipGroupStore = {
			seat: `tooltip-seat-${++groupCount}`,
			subscribe(listener) {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
			getActive: () => active,
			getWarm: () => warm,
			getSkipped: () => skipped,
			getTravel: () => travel,
			open(id, immediate, x) {
				if (blocked === id) return;
				closeTimer = stop(closeTimer);
				coolTimer = stop(coolTimer);
				if (active === id) return;
				const arrive = () => {
					travel = lastX !== null && x !== undefined ? Math.sign(x - lastX) : 0;
					lastX = x ?? null;
					pending = null;
					setActive(id);
				};
				if (immediate || warm) {
					openTimer = stop(openTimer);
					arrive();
					return;
				}
				openTimer = stop(openTimer);
				pending = id;
				openTimer = setTimeout(arrive, getTiming().openDelay);
			},
			close(id, immediate) {
				if (pending === id) {
					openTimer = stop(openTimer);
					pending = null;
				}
				if (active !== id) return;
				const finish = () => {
					closeTimer = undefined;
					setActive(null);
					cool();
				};
				closeTimer = stop(closeTimer);
				if (immediate || getTiming().closeDelay <= 0) finish();
				else closeTimer = setTimeout(finish, getTiming().closeDelay);
			},
			dismiss(id) {
				blocked = id;
				openTimer = stop(openTimer);
				closeTimer = stop(closeTimer);
				coolTimer = stop(coolTimer);
				pending = null;
				warm = false;
				if (active === id) setActive(null);
				else notify();
			},
			unblock(id) {
				if (blocked === id) blocked = null;
			},
			reset() {
				openTimer = stop(openTimer);
				closeTimer = stop(closeTimer);
				coolTimer = stop(coolTimer);
				pending = null;
				blocked = null;
				lastX = null;
				travel = 0;
				warm = false;
				if (active !== null) setActive(null);
				else notify();
			},
			dispose() {
				openTimer = stop(openTimer);
				closeTimer = stop(closeTimer);
				coolTimer = stop(coolTimer);
				listeners.clear();
			}
		};
		return store;
	}
</script>
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { setContext } from 'svelte';
	let { children, openDelay = 200, closeDelay = 120, skipDelay = 400, class: className = '' }: Props = $props();
	const store = createTooltipGroupStore(() => ({ openDelay, closeDelay, skipDelay }));
	setContext(TOOLTIP_GROUP_KEY, store);
	onMount(() => {
		const reset = () => store.reset();
		const visibility = () => document.hidden && store.reset();
		window.addEventListener('blur', reset);
		document.addEventListener('visibilitychange', visibility);
		return () => {
			window.removeEventListener('blur', reset);
			document.removeEventListener('visibilitychange', visibility);
		};
	});
	onDestroy(() => store.dispose());
</script>
<div class={className}>{@render children()}</div>
